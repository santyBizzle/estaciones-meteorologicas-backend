import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicion } from '../medicion/entities/medicion.entity';
import { Estacion } from '../estacion/entities/estacion.entity';
import { TipoMedicion } from '../tipo-medicion/entities/tipo-medicion.entity';
import { IaService } from './ia.service';
import { TelegramService } from '../telegram/telegram.service';
import { IaCronService } from './ia-cron.service';
import { IaController } from './ia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medicion, Estacion, TipoMedicion])],
  controllers: [IaController],
  providers: [IaService, TelegramService, IaCronService],
  exports: [IaService, TelegramService, IaCronService],
})
export class IaModule {}
