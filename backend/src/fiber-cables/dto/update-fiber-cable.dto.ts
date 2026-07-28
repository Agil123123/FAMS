import { PartialType } from '@nestjs/swagger';
import { CreateFiberCableDto } from './create-fiber-cable.dto';

export class UpdateFiberCableDto extends PartialType(CreateFiberCableDto) {}
