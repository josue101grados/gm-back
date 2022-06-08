import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
// import { SearchService } from './elasticsearch.service';
// import { FunnelsModule } from 'modules/funnels/funnels.module';

@Module({
  //   imports: [
  //     ElasticsearchModule.registerAsync({
  //       imports: [ConfigModule],
  //       useFactory: async (configService: ConfigService) => ({
  //         node: configService.get<string>('ELASTICSEARCH_HOST'),
  //         auth: {
  //           username: configService.get<string>('ELASTICSEARCH_USER'),
  //           password: configService.get<string>('ELASTICSEARCH_PWD'),
  //         },
  //         log: 'debug',
  //       }),
  //       inject: [ConfigService],
  //     }),
  //     forwardRef(() => FunnelsModule),
  //   ],
  //   providers: [SearchService],
  //   exports: [SearchService],
})
export class SearchModule {}
