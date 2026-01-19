import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProvidersService } from '../providers/providers.service';
import { UserRole } from '@prisma/client';
import { UpdateProviderVisibilityDto } from './dto/update-provider-visibility.dto';
import { ProviderDetailsDto } from '../providers/dto/provider-details.dto';
import { Request as ExpressRequest } from 'express';

type RequestWithUser = ExpressRequest & {
  user?: {
    userId?: string;
    role?: UserRole;
  };
};

@ApiTags('admin/providers')
@Controller('admin/providers')
export class AdminProvidersController {
  private readonly logger = new Logger(AdminProvidersController.name);

  constructor(private readonly providersService: ProvidersService) {}

  @Patch(':id/visibility')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar o status de visibilidade da vitrine de um provedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do provedor atualizado com o novo status de vitrine',
    type: ProviderDetailsDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Provedor não encontrado.' })
  async updateVisibility(
    @Param('id') id: string,
    @Body() dto: UpdateProviderVisibilityDto,
    @Req() req: RequestWithUser,
  ): Promise<ProviderDetailsDto> {
    const provider = await this.providersService.setProviderVisibility(
      id,
      dto.visibilityStatus,
      dto.visibilityReason,
      req.user?.userId,
    );
    return new ProviderDetailsDto(provider);
  }
}
