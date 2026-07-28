import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ enum: UserStatus, description: 'User status', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
