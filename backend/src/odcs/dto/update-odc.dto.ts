import { PartialType } from '@nestjs/swagger';
import { CreateOdcDto } from './create-odc.dto';

export class UpdateOdcDto extends PartialType(CreateOdcDto) {}
