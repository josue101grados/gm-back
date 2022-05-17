import { Console, Command, createSpinner } from 'nestjs-console';
import { SearchService } from 'modules/elasticsearch/elasticsearch.service';
import * as ora from 'ora';

@Console({
  name: 'indexes',
  description: 'Create ES Indexes',
})
export class ElasticsearchCLIService {
  constructor(private readonly service: SearchService) {}

  async generalCommand(commandFunction): Promise<void> {
    const spin = createSpinner();
    spin.start('Indexing...');
    await commandFunction(spin);
    spin.succeed('Indexing finished');
  }

  @Command({
    command: 'create-leads-index',
    description: `Create Index for Leads`,
  })
  async createLeadsIndex(): Promise<void> {
    await this.generalCommand(async (spin: ora.Ora) => {
      // await this.service.rebuildLeadsIndex(spin);
    });
  }

  @Command({
    command: 'index-leads-with-funnel',
    description: `Index Leads Data`,
  })
  async indexLeadsWithFunnel(): Promise<void> {
    await this.generalCommand(async (spin: ora.Ora) => {
      // await this.service.indexLeadsWithFunnel(spin);
    });
  }
}
