import { Test, TestingModule } from '@nestjs/testing';
import { AivoService } from './aivo.service';

describe('AivoService', () => {
  let service: AivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AivoService],
    }).compile();

    service = module.get<AivoService>(AivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
