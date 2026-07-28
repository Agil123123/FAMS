import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOdpDto {
  @ApiProperty({ example: 'ODP-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asset_code!: string;

  @ApiProperty({ example: 'Pole 14 Splitter' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'uuid-of-closure' })
  @IsUUID()
  @IsNotEmpty()
  closure_id!: string;
}
