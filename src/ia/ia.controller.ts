import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IaCronService } from './ia-cron.service';
import { TelegramService } from '../telegram/telegram.service';
import { IaService } from './ia.service';
import { Public } from '../auth/auth.guard';

@ApiTags('ia')
@Controller('ia')
export class IaController {
  constructor(
    private readonly iaCronService: IaCronService,
    private readonly telegramService: TelegramService,
    private readonly iaService: IaService,
  ) {}

  @Public()
  @Post('analizar')
  @ApiOperation({ summary: 'Ejecutar análisis manual de anomalías con Gemini IA' })
  async ejecutarAnalizar() {
    return await this.iaCronService.ejecutarAnalisis();
  }

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Consultar al Asistente Virtual Gemini IA' })
  async chat(@Body('prompt') prompt: string) {
    const telemetria = await this.iaCronService.obtenerTelemetriaReciente();
    const respuesta = await this.iaService.responderChat(prompt || 'Hola', telemetria);
    return { respuesta };
  }

  @Public()
  @Post('test-telegram')
  @ApiOperation({ summary: 'Enviar mensaje de prueba a Telegram' })
  async testTelegram(@Body('mensaje') mensaje?: string) {
    const textoPrueba =
      mensaje ||
      '<b>🌤️ Sistema de Estaciones Meteorológicas</b>\n\nPrueba de envío de alertas por Telegram iniciada correctamente.';
    const exito = await this.telegramService.sendAlertMessage(textoPrueba);
    return { exito, mensajeEnviado: textoPrueba };
  }
}
