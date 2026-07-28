import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'MANAGER', description: 'Unique role name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Management role', description: 'Role description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false, description: 'Is a system defined role?', required: false })
  @IsBoolean()
  @IsOptional()
  is_system?: boolean;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], description: 'Array of Permission IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permission_ids?: string[];
}
