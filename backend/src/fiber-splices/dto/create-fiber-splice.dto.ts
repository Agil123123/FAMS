import { IsNotEmpty, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFiberSpliceDto {
  @ApiProperty({ example: 'uuid-of-fiber-core' })
  @IsUUID()
  @IsNotEmpty()
  fiber_core_id!: string;

  @ApiProperty({ example: 0.15, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  attenuation?: number;
}
