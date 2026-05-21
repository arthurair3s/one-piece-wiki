import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { CharacterVersionsModule } from './character-versions/character-versions.module';
import { IslandCharacterVersionsModule } from './island-character-versions/island-character-versions.module';
import { ArcsModule } from './arcs/arcs.module';
import { SagasModule } from './sagas/sagas.module';
import { IslandsModule } from './islands/islands.module';
import { EventsModule } from './events/events.module';
import { CdcModule } from './cdc/cdc.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    PermissionsModule,
    CharactersModule,
    CharacterVersionsModule,
    IslandCharacterVersionsModule,
    ArcsModule,
    SagasModule,
    IslandsModule,
    EventsModule,
    CdcModule,

    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: false,
      })
    }),
    SequelizeModule.forRootAsync({
      name: 'read-db',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE_READ'),
        autoLoadModels: true,
        synchronize: true, // cria tabelas do Read DB automaticamente
      }),
    }),
  ],
})
export class AppModule { }
