import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Campaign } from './campaign.entity';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { RolesGuard } from 'modules/auth/guards/roles.guard';

@Crud({
  model: {
    type: Campaign,
  },
  query: {
    join: {
      campaignAliases: {
        eager: true,
      },
    },
  },
  routes: {
    createOneBase: {
      decorators: [Roles('admin')],
    },
    createManyBase: {
      decorators: [Roles('admin')],
    },
    updateOneBase: {
      decorators: [Roles('admin')],
    },
    replaceOneBase: {
      decorators: [Roles('admin')],
    },
    deleteOneBase: {
      decorators: [Roles('admin')],
    },
  },
})
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController implements CrudController<Campaign> {
  constructor(public service: CampaignsService) {}
  // constructor(private readonly campaignsService: CampaignsService) {}

  // @Get()
  // findAll(): Promise<Campaign[]> {
  //   return this.campaignsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string): Promise<Campaign> {
  //   return this.campaignsService.findOne(id);
  // }

  // @Post()
  // create(@Body() createCampaignDto: CreateCampaignDto): Promise<Campaign> {
  //   return this.campaignsService.create(createCampaignDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string): Promise<void> {
  //   return this.campaignsService.remove(id);
  // }
}
