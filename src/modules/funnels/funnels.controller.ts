import {
  Controller,
  Get,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { Crud } from '@nestjsx/crud';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Funnel } from './funnel.entity';
import { FunnelsService } from './funnels.service';
import { UsersService } from 'modules/users/users.service';
// import { SearchService } from 'modules/elasticsearch/elasticsearch.service';
import { get } from 'lodash';

@Crud({
  model: {
    type: Funnel,
  },
  query: {
    join: {
      cityAliases: { eager: false },
    },
  },
})
@Controller('funnels')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
)
@UseInterceptors(ClassSerializerInterceptor)
export class FunnelsController {
  constructor(
    private service: FunnelsService,
    private usersService: UsersService, // private searchService: SearchService,
  ) {}

  @Get('download')
  @Roles('inxait', 'admin')
  async downloadFunnels() {
    const documentLink = await this.service.downloadFunnels();

    if (documentLink) {
      return {
        message: '',
        documentLink,
      };
    }

    return {
      message: 'No hay leads pendientes para descargar',
      documentLink: null,
    };
  }

  @Get('search')
  @Roles('nodo', 'callcenter_dealer', 'admin')
  async searchFunnel(@Req() req) {
    const user = await this.usersService.findOne({
      where: { id: req.user.userId, status: 'ACTIVO' },
      relations: ['dealerGroup'],
    });

    const derived = get(req.query, 'derived', null);
    return await this.service.findOneFunnelByDocumentOrPhone(
      req.query.search,
      user.dealerGroup ? user.dealerGroup.id : null,
      derived,
    );
  }
}
