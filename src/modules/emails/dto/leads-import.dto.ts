import { SendEmailDto } from './send-email.dto';

export interface LeadsImportEmailDto extends SendEmailDto {
  readonly context: {
    readonly type: string;
    readonly sendErrorsEmail: boolean;
    readonly errorsURL: string | null;
    message?: string | null;
  };
}
