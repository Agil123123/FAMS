import { IsString, IsNotEmpty, IsUUID, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFiberCableDto {
  @ApiProperty({ example: 'CBL-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asset_code!: string;

  @ApiProperty({ example: 'uuid-of-cable-type' })
  @IsUUID()
  @IsNotEmpty()
  cable_type_id!: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber()
  @Min(0)
  length_meters!: number;
}
