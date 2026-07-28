import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AssignOnuDto } from './dto/assign-onu.dto';
import { AssignPackageDto } from './dto/assign-package.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new customer (DRAFT)' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
    return this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all customers' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get a customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update a customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
    return this.customersService.update(id, updateCustomerDto, req.user.id);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Soft delete a customer' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.customersService.remove(id, req.user.id);
  }

  @Post(':id/onu')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Assign an ONU to a customer' })
  assignOnu(@Param('id') id: string, @Body() assignOnuDto: AssignOnuDto, @Request() req: any) {
    return this.customersService.assignOnu(id, assignOnuDto, req.user.id);
  }

  @Post(':id/package')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Assign a Billing Package to a customer' })
  assignPackage(@Param('id') id: string, @Body() assignPackageDto: AssignPackageDto, @Request() req: any) {
    return this.customersService.assignPackage(id, assignPackageDto, req.user.id);
  }

  @Post(':id/activate')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Activate a customer' })
  activate(@Param('id') id: string, @Request() req: any) {
    return this.customersService.activate(id, req.user.id);
  }

  @Post(':id/terminate')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Terminate a customer' })
  terminate(@Param('id') id: string, @Request() req: any) {
    return this.customersService.terminate(id, req.user.id);
  }

  @Post(':id/relocate')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Relocate a customer to a new ODP' })
  relocate(@Param('id') id: string, @Body('new_odp_id') newOdpId: string, @Request() req: any) {
    return this.customersService.relocate(id, newOdpId, req.user.id);
  }
}
