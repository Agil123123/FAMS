import { PartialType } from '@nestjs/swagger';
import { CreateHomepassDto } from './create-homepass.dto';

export class UpdateHomepassDto extends PartialType(CreateHomepassDto) {}
