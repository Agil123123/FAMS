import { Module } from '@nestjs/common';
import { OltsService } from './olts.service';
import { OltsController } from './olts.controller';

@Module({
  controllers: [OltsController],
  providers: [OltsService],
})
export class OltsModule {}
