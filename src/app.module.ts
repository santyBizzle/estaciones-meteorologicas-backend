import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch/batch.service';
import {DatabaseTimezoneService} from './DatabaseTimezoneService';

//import { AuthModule } from './auth/auth.module';
import { Usuario } from './usuario/entities/usuario.entity';
import { Estacion } from './estacion/entities/estacion.entity';
import { Unidad } from './unidad/entities/unidad.entity';
import { TipoMedicion } from './tipo-medicion/entities/tipo-medicion.entity';
import { Informe } from './informe/entities/informe.entity';
import { InformeEstacion } from './informe-estacion/entities/informe-estacion.entity';
import { Medicion } from './medicion/entities/medicion.entity';
import { MedicionHistorico } from './medicion/entities/medicion-historico.entity';
import { Rol } from './rol/entities/rol.entity';

import { UsuarioModule } from './usuario/usuario.module';
import { EstacionModule } from './estacion/estacion.module';
import { UnidadModule } from './unidad/unidad.module';
import { TipoMedicionModule } from './tipo-medicion/tipo-medicion.module';
import { InformeModule } from './informe/informe.module';
import { InformeEstacionModule } from './informe-estacion/informe-estacion.module';
import { MedicionModule } from './medicion/medicion.module';
import { RolModule } from './rol/rol.module';
import { AppGateway } from './app.gateway';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: (configService.get<string>('DB_TYPE') || 'postgres') as any,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 5432)),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'red_estaciones'),
        entities: [
          Usuario,
          Estacion,
          Unidad,
          TipoMedicion,
          Informe,
          InformeEstacion,
          Medicion,
          MedicionHistorico,
          Rol,
        ],
        synchronize: String(configService.get('DB_SYNCHRONIZE', 'true')) === 'true',
        logging: String(configService.get('DB_LOGGING', 'true')) === 'true',
      }),
    }),
    ScheduleModule.forRoot(),
    UsuarioModule,
    EstacionModule,
    UnidadModule,
    TipoMedicionModule,
    InformeModule,
    InformeEstacionModule,
    MedicionModule,
    RolModule,
    SocketModule,
    AuthModule,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService,AppGateway,BatchService,DatabaseTimezoneService],
})
export class AppModule {}