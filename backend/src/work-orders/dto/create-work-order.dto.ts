import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
