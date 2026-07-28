import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOdcDto {
  @ApiProperty({ example: 'ODC-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asset_code!: string;

  @ApiProperty({ example: 'North Region Cabinet' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'uuid-of-pon-port' })
  @IsUUID()
  @IsNotEmpty()
  pon_port_id!: string;
}
