import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const config = [
  {
    type: 'mysql' as 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    seeds: [`${__dirname}/seeds/*.seed{.ts,.js}`],
    cli: {
      entitiesDir: 'src/modules',
      migrationsDir: 'src/migrations',
    },
    timezone: '-05:00',
  },
  {
    name: 'seed',
    type: 'mysql' as 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    migrations: ['src/seeds/*{.ts,.js}'],
    migrationsTableName: 'seeds',
    cli: {
      entitiesDir: 'src/modules',
      migrationsDir: 'src/seeds',
    },
    timezone: '-05:00',
  },
];

export = config;
