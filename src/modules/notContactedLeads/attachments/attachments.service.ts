import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { NotContactedLeadsAttachments } from './attachments.entity';
import { NotContactedLeadsService } from '../notContactedLeads.service';
import { UploadsService } from '../../uploads/uploads.service';
import {
  JustificationObservation,
  ValidationStatus,
} from '../notContactedLeads.entity';

@Injectable()
export class NotContactedLeadsAttachmentsService extends TypeOrmCrudService<
  NotContactedLeadsAttachments
> {
  instanceSlug: string;
  instanceName: string;
  opNames: string[] = [];
  constructor(
    @InjectRepository(NotContactedLeadsAttachments) repo,
    private uploadsService: UploadsService,
    @Inject(forwardRef(() => NotContactedLeadsService))
    private notContactedLeadsService: NotContactedLeadsService,
  ) {
    super(repo);
  }

  async uploadAttachment(opName: string, file) {
    const notContactedLead = await this.notContactedLeadsService.getNotContactedLead(
      opName,
    );
    if (!notContactedLead) {
      this.uploadsService.deleteFile(file.path);
      throw new HttpException(
        'NotContactedLead not founded',
        HttpStatus.NO_CONTENT,
      );
    }
    try {
      // Upload the attachment to Google
      const filePath = await this.uploadsService.uploadAndGetPublicUrl(
        file.path,
        `uploads/not-contacted-leads-uploads/validations/${file.filename}`,
      );
      // Delete the file locally after it's uploaded to Google
      this.uploadsService.deleteFile(file.path);
      // Save the attachment in the database
      await this.saveAttachment(opName, filePath.publicURL, file.originalname);
      // Finally I update the NotContactedLeadStatus
      await this.notContactedLeadsService.updateStatus(
        notContactedLead.opportunityName,
        ValidationStatus.PENDING,
        notContactedLead.justificationDate,
      );
      return 'Adjunto subido';
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveAttachment(opName, filePath, fileName) {
    const newAttachment = this.repo.create();
    newAttachment.filePath = filePath;
    newAttachment.fileName = fileName;
    newAttachment.status = ValidationStatus.PENDING;
    newAttachment.opportunityName = opName;
    await this.repo.save(newAttachment);
  }

  async getAttachments(notContactedLeadId: number) {
    return await this.repo
      .createQueryBuilder('ncla')
      .select()
      .innerJoin(
        'ncla.notContactedLead',
        'ncl',
        'ncl.opportunityName = ncla.opportunityName',
      )
      .where(`ncla.notContactedLeadId = ${notContactedLeadId}`)
      .getMany();
  }

  async getAttachmentsByOpName(opName: string) {
    return await this.repo
      .createQueryBuilder()
      .select()
      .where(`opportunityName = '${opName}'`)
      .getMany();
  }

  async updateStatus(
    opName: string,
    status: ValidationStatus,
    justificationObservation: JustificationObservation,
  ) {
    const justificationObserVationString = justificationObservation as string;

    return await this.repo
      .createQueryBuilder()
      .update()
      .where(`opportunityName = '${opName}'`)
      .set({
        status: () => `'${status}'`,
        justificationObservation: () =>
          justificationObserVationString === 'null'
            ? `null`
            : `'${justificationObservation}'`,
      })
      .execute();
  }
}
