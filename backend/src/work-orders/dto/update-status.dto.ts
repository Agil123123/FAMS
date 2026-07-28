import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(WorkOrderStatus)
  @IsNotEmpty()
  status!: WorkOrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
