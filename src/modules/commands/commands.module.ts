import { Module } from '@nestjs/common';
import { ElasticsearchCLIService } from 'modules/commands/elasticsearch.cli';
import { SearchModule } from 'modules/elasticsearch/elasticsearch.module';

@Module({
  // imports: [SearchModule],
  // providers: [ElasticsearchCLIService],
})
export class CommandsModule {}
