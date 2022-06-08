import { Controller, Get } from '@nestjs/common';

import { ResultsLeadsSalesService } from './resultsLeadsSales.service';

@Controller('results-leads-sales')
export class ResultsLeadsSalesController {
  constructor(private resultsLeadsSalesService: ResultsLeadsSalesService) {}

  @Get()
  async findAll() {
    return await this.resultsLeadsSalesService.generateResultsBasedOnLeadMonth();
  }
}
