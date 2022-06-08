import { Test, TestingModule } from '@nestjs/testing';
import { SourcedLeadsService } from './sourcedLeads.service';

describe('SourcedLeadsService', () => {
  let service: SourcedLeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourcedLeadsService],
    }).compile();

    service = module.get<SourcedLeadsService>(SourcedLeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
