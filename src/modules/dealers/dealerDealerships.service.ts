import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DealerDealership } from './dealerDealership.entity';
import { DealerDealershipAliasesService } from './dealerDealershipAliases.service';

@Injectable()
export class DealerDealershipsService extends TypeOrmCrudService<
  DealerDealership
> {
  constructor(
    @InjectRepository(DealerDealership) repo,
    private aliasesService: DealerDealershipAliasesService,
  ) {
    super(repo);
  }
  async findByBac(bac: string): Promise<DealerDealership> {
    const dealerDealership = await this.repo.findOne({
      where: [{ bac }],
      relations: ['city', 'dealerCity', 'dealerCity.dealerGroup'],
    });
    if (dealerDealership) {
      return dealerDealership;
    }
    return null;
  }
  async findByBacOrNameAlias(
    bac: string,
    name: string,
  ): Promise<DealerDealership> {
    const dealerDealership = await this.repo.findOne({
      where: [{ bac }, { name }],
      relations: ['city', 'dealerCity', 'dealerCity.dealerGroup'],
    });
    if (dealerDealership) {
      return dealerDealership;
    } else {
      const dealerDealershipAlias = await this.aliasesService.findOne({
        where: { name },
        relations: [
          'dealerDealership',
          'dealerDealership.city',
          'dealerDealership.dealerCity',
          'dealerDealership.dealerCity.dealerGroup',
        ],
      });
      if (dealerDealershipAlias) {
        return dealerDealershipAlias.dealerDealership;
      }
    }
    return null;
  }
  async updateImage(id, image: string) {
    return this.repo.update(id, { image });
  }
}
