import { Module } from '@nestjs/common';
import { HomepassesService } from './homepasses.service';
import { HomepassesController } from './homepasses.controller';

@Module({
  controllers: [HomepassesController],
  providers: [HomepassesService],
})
export class HomepassesModule {}
