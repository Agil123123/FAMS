// ==========================================================
// Roles Module
// ==========================================================

import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
