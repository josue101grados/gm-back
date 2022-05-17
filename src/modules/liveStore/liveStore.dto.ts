import {
  IsOptional,
  IsDate,
  IsBoolean,
  IsPositive,
  IsEnum,
  ValidateIf,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

import {
  NotInterestedReason,
  Status,
  Version,
  ClientType,
  MaritalStatus,
} from './liveStore.entity';

export class CreateLiveStoreDto {
  @IsDate()
  @ApiProperty({ description: 'Format: mm-dd-aaaa | Example: 07-23-2027' })
  readonly managementDate: Date;

  @IsBoolean()
  @ApiProperty()
  readonly isInterested: boolean;

  @IsOptional()
  @IsEnum(NotInterestedReason)
  @ApiProperty()
  readonly notInterestedReason?: NotInterestedReason;

  @IsBoolean()
  @ApiProperty()
  readonly virtualExperience: boolean;

  @IsDate()
  @ApiProperty({ description: 'Format: mm-dd-aaaa | Example: 07-23-2027' })
  readonly virtualExperienceDate: Date;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly leadId?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly temporalLeadId?: number;

  @IsPositive()
  @ApiProperty()
  readonly userId: number;

  @IsOptional()
  @ApiProperty()
  readonly chosenModel?: string;
}

export class UpdateLiveStoreDto extends PartialType(CreateLiveStoreDto) {
  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Format: mm-dd-aaaa | Example: 07-23-2027' })
  readonly dealerManagementDate?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly callAttempt?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly effectiveContact?: boolean;

  @IsOptional()
  @IsEnum(Status)
  @ApiProperty()
  readonly status?: Status;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly financing?: boolean;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly adviserId?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly isInterestedInFinancing?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly serieRUT?: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Format: mm-dd-aaaa | Example: 07-23-2027' })
  readonly birthDate?: Date;

  @IsOptional()
  @IsEnum(MaritalStatus)
  @ApiProperty()
  readonly maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsEnum(ClientType)
  @ApiProperty()
  readonly clientType?: ClientType;

  @IsOptional()
  @Min(0)
  @ApiProperty()
  readonly yearsOnCurrentJob?: number;

  @IsOptional()
  @Min(0)
  @ApiProperty()
  readonly monthsOnCurrentJob?: number;

  @IsOptional()
  @Min(0)
  @ApiProperty()
  readonly monthlyIncome?: number;

  @IsOptional()
  @IsEnum(Version)
  @ApiProperty()
  readonly version?: Version;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly threshold?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly plan?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly deadline?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly preapprovedCredit?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly leadAlreadyCreated?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly notVirtualExperienceReason?: string;
}

export class FilterLiveStoreDto {
  @IsOptional()
  @IsPositive()
  readonly dealerGroupId?: number;

  @ValidateIf(item => item.year)
  @IsPositive()
  readonly month?: number;

  @ValidateIf(item => item.month)
  @IsPositive()
  readonly year?: number;

  @IsOptional()
  @IsBoolean()
  readonly interested?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly dealerManagementDate?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly virtualExperienceDate?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly virtualExperience?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly orderByName?: boolean;

  @IsOptional()
  @IsPositive()
  readonly userId?: number;

  @IsOptional()
  @IsBoolean()
  readonly orderByVirtualExperienceDate?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly retrieveCallAgainLeads?: boolean;
}
