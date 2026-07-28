import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssignOnuDto {
  @IsString()
  @IsNotEmpty()
  serial_number!: string;

  @IsString()
  @IsOptional()
  mac_address?: string;
}
