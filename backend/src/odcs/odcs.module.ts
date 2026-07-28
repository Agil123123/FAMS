import { Module } from '@nestjs/common';
import { OdcsService } from './odcs.service';
import { OdcsController } from './odcs.controller';

@Module({
  controllers: [OdcsController],
  providers: [OdcsService],
})
export class OdcsModule {}
