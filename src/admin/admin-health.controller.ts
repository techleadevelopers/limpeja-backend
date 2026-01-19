import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('admin/health')
@Controller('admin/health')
export class AdminHealthController {
  @Get()
  @ApiOperation({ summary: 'Retorna o estado de saúde do backend administrativo' })
  @ApiResponse({
    status: 200,
    description: 'Indica que o serviço administrativo está operacional.',
  })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
