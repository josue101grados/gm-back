import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Model } from './model.entity';
import { ModelAliasesService } from './modelAliases.service';

@Injectable()
export class ModelsService extends TypeOrmCrudService<Model> {
  constructor(
    @InjectRepository(Model) repo,
    private aliasesService: ModelAliasesService,
  ) {
    super(repo);
  }
  async findByNameOrAlias(nameOrAlias: string): Promise<Model> {
    const modelByFamily = await this.findOne({
      where: { family: nameOrAlias },
      relations: ['segment'],
    });
    if (modelByFamily) {
      return modelByFamily;
    } else {
      const model = await this.findOne({
        where: { model: nameOrAlias },
        relations: ['segment'],
      });
      if (model) {
        return model;
      } else {
        const alias = await this.aliasesService.findOne({
          where: { name: nameOrAlias },
          relations: ['model', 'model.segment'],
        });
        if (alias) {
          return alias.model;
        }
      }
    }
    return null;
  }
  async updateImage(id, image: string) {
    return this.repo.update(id, { image });
  }
  async updateAdditionalImage(id, additionalImage: string) {
    return this.repo.update(id, { additionalImage });
  }
}
