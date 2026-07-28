import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ContextBuilderService } from './context/context-builder.service';
import { FiberAnalysisEngine } from './engines/fiber-analysis.engine';
import { CustomerAnalysisEngine } from './engines/customer-analysis.engine';
import { RecommendationEngine } from './engines/recommendation.engine';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    ContextBuilderService,
    FiberAnalysisEngine,
    CustomerAnalysisEngine,
    RecommendationEngine,
  ],
  exports: [AiService],
})
export class AiModule {}
