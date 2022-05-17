import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Campaign } from './campaign.entity';
import { CampaignAliasesService } from './campaignAliases.service';

@Injectable()
export class CampaignsService extends TypeOrmCrudService<Campaign> {
  constructor(
    @InjectRepository(Campaign) repo,
    private aliasesService: CampaignAliasesService,
  ) {
    super(repo);
  }
  async findByNameOrAlias(nameOrAlias: string): Promise<Campaign | null> {
    const result = await this.repo.findOne({ where: { name: nameOrAlias } });
    if (result) {
      return result;
    } else {
      const alias = await this.aliasesService.findOne({
        where: { name: nameOrAlias },
        relations: ['campaign'],
      });
      if (alias) {
        return alias.campaign;
      }
    }
    return null;
  }
  // constructor(
  //   @InjectRepository(Campaign)
  //   private campaignsRepository: Repository<Campaign>,
  // ) {}
  //
  // findAll(): Promise<Campaign[]> {
  //   return this.campaignsRepository.find();
  // }

  // findOne(id: string): Promise<Campaign> {
  //   return this.campaignsRepository.findOne(id);
  // }

  // create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
  //   const campaign = new Campaign();
  //   campaign.name = createCampaignDto.name;
  //   campaign.isActive = createCampaignDto.isActive;

  //   return this.campaignsRepository.save(campaign);
  // }

  // async remove(id: string): Promise<void> {
  //   await this.campaignsRepository.delete(id);
  // }
}
