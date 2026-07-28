import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPackageDto {
  @IsUUID()
  @IsNotEmpty()
  package_profile_id!: string;
}
