import { IsString, IsNotEmpty } from 'class-validator';

export class AddPhotoDto {
  @IsString()
  @IsNotEmpty()
  photo_url!: string;
}
