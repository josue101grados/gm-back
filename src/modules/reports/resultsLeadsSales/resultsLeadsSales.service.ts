import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResultLeadsSales } from './resultLeadSale.entity';
import {
  CreateResultLeadsSalesDto,
  UpdateResultLeadsSalesDto,
} from './resultLeadsSales.dto';
import { LeadsService } from '../../leads/leads.service';
import { DealerGroupsService } from '../../dealers/dealerGroups.service';
import { DealerCitiesService } from '../../dealers/dealerCities.service';
import { DealerDealershipsService } from '../../dealers/dealerDealerships.service';

@Injectable()
export class ResultsLeadsSalesService {
  constructor(
    @InjectRepository(ResultLeadsSales)
    private readonly resultLeadsSalesRepo: Repository<ResultLeadsSales>,
    private readonly leadsService: LeadsService,
    private readonly dealerGroupsService: DealerGroupsService,
    private readonly dealerCitiesService: DealerCitiesService,
    private readonly dealerDealershipsService: DealerDealershipsService,
  ) {}

  async findOne(id: number) {
    const supplier = await this.resultLeadsSalesRepo.findOne(id, {});
    if (!supplier) throw new NotFoundException(`Result Leads Sales not found.`);
    return supplier;
  }

  async generateResultsBasedOnLeadMonth() {
    await this.generateAllDealerCityResults();
  }

  async generateAllDealerCityResults() {
    const dealerCities = await this.dealerCitiesService.find({
      where: {
        ignore: false,
      },
    });

    for (const dealerCity of dealerCities) {
      for (
        let leadMonth = 1;
        leadMonth <= new Date().getMonth() + 1;
        leadMonth++
      ) {
        await this.generateResultsBasedOnLeadMonthAndDealerCity(
          dealerCity.id,
          leadMonth,
          new Date().getFullYear(),
        );
      }
    }
  }

  async generateResultsBasedOnLeadMonthAndDealerCity(
    dealerCityId: number,
    leadMonth: number,
    leadYear: number,
  ) {
    const totalValidLeads = await this.leadsService.getTotalValidLeads(
      dealerCityId,
      leadMonth,
      leadYear,
    );
    console.log('totalValidLeads', totalValidLeads);
    console.log('');
    let totalSales = 0;
    for (let saleMonth = leadMonth; saleMonth <= 12; saleMonth++) {
      const totalLeadsThatHasASale = await this.leadsService.getTotalLeadsThatHasASale(
        dealerCityId,
        leadMonth,
        leadYear,
        saleMonth,
        // TODO:
        leadYear,
      );
      totalSales += totalLeadsThatHasASale;
      // console.log('totalLeadsThatHasASale', totalLeadsThatHasASale);
      await this.upsert({
        dealerCityId,
        leadMonth,
        leadYear,
        are120results: true,
        ...(saleMonth === 1 && { january: totalLeadsThatHasASale }),
        ...(saleMonth === 2 && { february: totalLeadsThatHasASale }),
        ...(saleMonth === 3 && { march: totalLeadsThatHasASale }),
        ...(saleMonth === 4 && { april: totalLeadsThatHasASale }),
        ...(saleMonth === 5 && { may: totalLeadsThatHasASale }),
        ...(saleMonth === 6 && { june: totalLeadsThatHasASale }),
        ...(saleMonth === 7 && { july: totalLeadsThatHasASale }),
        ...(saleMonth === 8 && { august: totalLeadsThatHasASale }),
        ...(saleMonth === 9 && { september: totalLeadsThatHasASale }),
        ...(saleMonth === 10 && { october: totalLeadsThatHasASale }),
        ...(saleMonth === 11 && { november: totalLeadsThatHasASale }),
        ...(saleMonth === 12 && { december: totalLeadsThatHasASale }),
      });
    }
    console.log('totalSales', totalSales);
    const closingRate = parseFloat(
      (
        (totalSales / (totalValidLeads !== 0 ? totalValidLeads : 1)) *
        100
      ).toFixed(2),
    );
    console.log('');
    console.log('closingRate', closingRate);
    await this.upsert({
      dealerCityId,
      leadMonth,
      leadYear,
      totalSales,
      closingRate,
    });
  }

  async upsert(data: CreateResultLeadsSalesDto) {
    const possiblyExistingResultLeadsSales = await this.resultLeadsSalesRepo.findOne(
      {
        where: {
          ...(data.dealerGroupId && {
            dealerGroup: { id: data.dealerGroupId },
          }),
          ...(data.dealerCityId && { dealerCity: { id: data.dealerCityId } }),
          ...(data.dealerDealershipId && {
            dealerDealership: { id: data.dealerDealershipId },
          }),
          leadMonth: data.leadMonth,
          leadYear: data.leadYear,
        },
      },
    );

    if (!possiblyExistingResultLeadsSales) return await this.create(data);

    return await this.update(possiblyExistingResultLeadsSales.id, data);
  }

  async create(data: CreateResultLeadsSalesDto) {
    const newResultLeadsSales = this.resultLeadsSalesRepo.create(data);

    if (!data.dealerGroupId && !data.dealerCityId && !data.dealerDealershipId)
      throw new BadRequestException(
        'At least one of the dealer fields must be filled',
      );

    if (!data.are120results && !data.are120results)
      throw new BadRequestException(
        'At least one of the 120 or 360 flag rules must be filled',
      );

    if (data.dealerGroupId)
      newResultLeadsSales.dealerGroup = await this.dealerGroupsService.findOne(
        data.dealerGroupId,
      );

    if (data.dealerCityId)
      newResultLeadsSales.dealerCity = await this.dealerCitiesService.findOne(
        data.dealerCityId,
      );

    if (data.dealerDealershipId)
      newResultLeadsSales.dealerDealership = await this.dealerDealershipsService.findOne(
        data.dealerDealershipId,
      );

    return await this.resultLeadsSalesRepo.save(newResultLeadsSales);
  }

  async update(id: number, changes: UpdateResultLeadsSalesDto) {
    const resultLeadsSales = await this.findOne(id);
    this.resultLeadsSalesRepo.merge(resultLeadsSales, changes);

    return await this.resultLeadsSalesRepo.save(resultLeadsSales);
  }
}
