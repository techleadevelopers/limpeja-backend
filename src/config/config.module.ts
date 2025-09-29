// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation-schema';
import configuration from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Disponível globalmente
      load: [configuration], // Carrega a configuração customizada
      validationSchema, // Schema de validação
      envFilePath: [ // Suporte para múltiplos arquivos .env
        '.env.local',
        '.env',
        `.env.${process.env.NODE_ENV || 'development'}`,
      ],
      validationOptions: { // Mesmas opções do app.module.ts original
        allowUnknown: true,
        abortEarly: true,
      },
      // Ignora erros de cache em dev
      cache: process.env.NODE_ENV === 'production',
    }),
  ],
  exports: [NestConfigModule], // Exporta para outros módulos usarem ConfigService
})
export class ConfigModule {}