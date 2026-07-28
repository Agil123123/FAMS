// ==========================================================
// Login DTO
// ==========================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@fams.id', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Admin@123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
