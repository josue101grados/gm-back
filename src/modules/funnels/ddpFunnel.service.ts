import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { agregateTwoObjects } from './common/utils';
import { DdpFunnel } from './ddpFunnel.entity';

@Injectable()
export class DdpFunnelsService extends TypeOrmCrudService<DdpFunnel> {
  constructor(@InjectRepository(DdpFunnel) public repo: Repository<DdpFunnel>) {
    super(repo);
  }

  async findByYearMonthAndDealer(year: number, month: number, dealer: number): Promise<DdpFunnel> {
    return this.repo.findOne({
      where: {
        year,
        month,
        dealer: { id: dealer },
      },
      relations: ['dealer'],
    });
  }

  async findAllByYearMonthAndDealer(year: number, month: number, dealer: number) {
    return this.repo.find({
      where: {
        year,
        month,
        dealer: { id: dealer },
      },
      relations: ['dealer'],
    });
  }

  async findByYearAndDealer(year: number, dealer: number) {
    return this.repo.find({
      where: {
        year,
        dealer: { id: dealer },
      },
      relations: ['dealer'],
    });
  }

  async findByYearMonth(
    year: number,
    month: number,
  ) {
    return this.repo.find({
      where: {
        year,
        month,
      },
      relations: ['dealer'],
    });
  }

  getEmptyT1Funnel() {
    return {
      contacts: 0,
      interested: 0,
      quoteAsked: 0,
      creditRequests: {
        produbanco: 0,
        guayaquil: 0,
        chevyplan: 0,
        cooperativas: 0,
        others: 0,
        total: 0,
      },
      creditApprovals: {
        produbanco: 0,
        guayaquil: 0,
        chevyplan: 0,
        cooperativas: 0,
        others: 0,
        total: 0,
      },
      creditRejections: {
        produbanco: 0,
        guayaquil: 0,
        chevyplan: 0,
        cooperativas: 0,
        others: 0,
        total: 0,
      },
      interestedOnCashPayment: 0,
      paymentPostponed: 0,
      diffrentIdSales: 0,
      reservations: {
        credit: 0,
        cash: 0,
      },
      billed: {
        credit: 0,
        cash: 0,
      },
    };
  }

  mergeDDPFunnels(funnels: DdpFunnel[]): DdpFunnel {
    let result: DdpFunnel = {} as DdpFunnel;
    for (const funnel of funnels) {
      result = agregateTwoObjects(result, funnel, ['dealer', 'month', 'year']);
    }
    result.dealer = funnels[0].dealer;
    result.month = funnels[0].month;
    result.year = funnels[0].year;
    return result;
  }
}
