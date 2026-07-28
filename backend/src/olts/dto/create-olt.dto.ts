import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOltDto {
  @ApiProperty({ example: 'OLT-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asset_code!: string;

  @ApiProperty({ example: 'Main OLT Hub' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsString()
  @IsOptional()
  @MaxLength(45)
  ip_address?: string;
}
