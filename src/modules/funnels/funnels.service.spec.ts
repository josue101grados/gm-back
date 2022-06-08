import { Test, TestingModule } from '@nestjs/testing';
import { FunnelsService } from './funnels.service';

describe('FunnelsService', () => {
  let service: FunnelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunnelsService],
    }).compile();

    service = module.get<FunnelsService>(FunnelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
