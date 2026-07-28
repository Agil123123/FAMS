import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFiberCoreDto {
  @ApiProperty({ example: 'Blue', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color_code?: string;
}
