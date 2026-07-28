import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSplitterDto {
  @ApiProperty({ example: 'SPL-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  asset_code!: string;

  @ApiProperty({ example: 'uuid-of-odp' })
  @IsUUID()
  @IsNotEmpty()
  odp_id!: string;

  @ApiProperty({ example: 'uuid-of-splitter-type' })
  @IsUUID()
  @IsNotEmpty()
  splitter_type_id!: string;
}
