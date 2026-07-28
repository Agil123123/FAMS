import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customer_code!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsUUID()
  @IsNotEmpty()
  odp_id!: string;
}
