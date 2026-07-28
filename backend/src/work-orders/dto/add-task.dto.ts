import { IsString, IsNotEmpty } from 'class-validator';

export class AddTaskDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
}
