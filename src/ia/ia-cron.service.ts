import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Medicion } from '../medicion/entities/medicion.entity';
import { ConfigService } from '@nestjs/config';
import { IaService } from './ia.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class IaCronService {
  private readonly logger = new Logger(IaCronService.name);

  constructor(
    @InjectRepository(Medicion)
    private readonly medicionRepository: Repository<Medicion>,
    private readonly configService: ConfigService,
    private readonly iaService: IaService,
    private readonly telegramService: TelegramService,
  ) {}

  // Se ejecuta cada 20 minutos por defecto usando la anotación de NestJS Cron
  @Cron('*/20 * * * *')
  async handleCronAnomalyCheck() {
    this.logger.log('⏰ Ejecutando revisión programada de anomalías con IA...');
    await this.ejecutarAnalisis();
  }

  async ejecutarAnalisis() {
    try {
      const intervalMinutes = Number(
        this.configService.get<number>('IA_CRON_INTERVAL_MINUTES', 20),
      );

      // Calcular fecha límite hacia atrás
      const fechaLimite = new Date(Date.now() - intervalMinutes * 60 * 1000);

      // Obtener mediciones recientes con sus relaciones de estación, tipo_medicion y unidad
      const medicionesRecientes = await this.medicionRepository.find({
        where: {
          created_at: MoreThanOrEqual(fechaLimite),
        },
        relations: ['estacion', 'tipo_medicion', 'tipo_medicion.unidad'],
        order: { created_at: 'DESC' },
        take: 100, // Limitar a las últimas 100 mediciones para no saturar
      });

      if (!medicionesRecientes || medicionesRecientes.length === 0) {
        this.logger.log(`No se encontraron mediciones nuevas en los últimos ${intervalMinutes} minutos.`);
        return { message: 'Sin nuevas mediciones para analizar', medicionesAnalizadas: 0 };
      }

      // Agrupar mediciones por estación
      const estacionesMap = new Map<string, any>();

      for (const m of medicionesRecientes) {
        const estKey = m.estacion ? m.estacion.numero_serie : 'Estacion_Desconocida';
        if (!estacionesMap.has(estKey)) {
          estacionesMap.set(estKey, {
            estacion: m.estacion?.descripcion || m.estacion?.modelo || estKey,
            numero_serie: estKey,
            mediciones: [],
          });
        }

        estacionesMap.get(estKey).mediciones.push({
          tipo: m.tipo_medicion?.nombre || 'Desconocido',
          valor: m.valor,
          unidad: m.tipo_medicion?.unidad?.descripcion || '',
          fecha: m.created_at,
        });
      }

      const payloadEstaciones = Array.from(estacionesMap.values());
      this.logger.log(`Enviando telemetría de ${payloadEstaciones.length} estación(es) a Gemini 2.5 Flash...`);

      // Analizar con Gemini IA
      const resultadoIA = await this.iaService.analizarMediciones(payloadEstaciones);

      if (!resultadoIA) {
        return { message: 'No se pudo obtener análisis de IA', estaciones: payloadEstaciones.length };
      }

      this.logger.log(`Resultado IA - ¿Hay Anomalía?: ${resultadoIA.hayAnomalia} | Nivel: ${resultadoIA.nivelRiesgo}`);

      // Si se detecta anomalía, enviar por Telegram
      if (resultadoIA.hayAnomalia && resultadoIA.mensajeTelegram) {
        this.logger.log('🚨 Anomalía detectada por IA! Notificando a Telegram...');
        await this.telegramService.sendAlertMessage(resultadoIA.mensajeTelegram);
      } else {
        this.logger.log('✅ Todo normal en las estaciones meteorológicas. No se enviaron alertas.');
      }

      return {
        message: 'Análisis de IA completado exitosamente',
        resultadoIA,
        estacionesAnalizadas: payloadEstaciones.length,
      };
    } catch (error) {
      this.logger.error('Error durante la ejecución del Cron de IA:', error);
      throw error;
    }
  }

  async obtenerTelemetriaReciente(): Promise<any[]> {
    try {
      const medicionesRecientes = await this.medicionRepository.find({
        relations: ['estacion', 'tipo_medicion', 'tipo_medicion.unidad'],
        order: { created_at: 'DESC' },
        take: 30,
      });

      const estacionesMap = new Map<string, any>();

      for (const m of medicionesRecientes) {
        const estKey = m.estacion ? m.estacion.numero_serie : 'Estacion_Desconocida';
        if (!estacionesMap.has(estKey)) {
          estacionesMap.set(estKey, {
            estacion: m.estacion?.descripcion || m.estacion?.modelo || estKey,
            numero_serie: estKey,
            mediciones: [],
          });
        }

        estacionesMap.get(estKey).mediciones.push({
          tipo: m.tipo_medicion?.nombre || 'Desconocido',
          valor: m.valor,
          unidad: m.tipo_medicion?.unidad?.descripcion || '',
          fecha: m.created_at,
        });
      }

      return Array.from(estacionesMap.values());
    } catch (error) {
      this.logger.error('Error al obtener telemetría reciente:', error);
      return [];
    }
  }
}
