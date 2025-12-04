import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
  Headers,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PaymentsService } from './payments.service';

import {
  CreatePixChargeDto,
  PixChargeResponseDto,
} from './dto/create-pix-charge.dto';

import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { UserRole } from '@prisma/client';

interface RequestUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  clientId?: string;
  providerId?: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // ---------------------------------------------------------------------------
  // Create PIX Charge
  // ---------------------------------------------------------------------------

  @Post('pix-charge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma nova cobrança PIX para um serviço ou provedor.',
    description:
      'Permite que um cliente gere uma cobrança PIX para efetuar o pagamento.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cobrança PIX criada com sucesso.',
    type: PixChargeResponseDto,
  })
  async createPixCharge(
    @Req() req: Request,
    @Body() createPixChargeDto: CreatePixChargeDto,
  ): Promise<PixChargeResponseDto> {
    const requestUser = req.user as RequestUserPayload;
    const clientUserId = requestUser.userId;

    this.logger.log(
      `[PaymentsController] createPixCharge: userId=${clientUserId} dto=${JSON.stringify(
        createPixChargeDto,
      )}`,
    );

    if (!clientUserId) {
      this.logger.error(
        '[PaymentsController] createPixCharge: userId não encontrado no token.',
      );
      throw new InternalServerErrorException(
        'ID do usuário não disponível no token de autenticação.',
      );
    }

    return this.paymentsService.createPixCharge(
      clientUserId,
      createPixChargeDto,
    );
  }

  // ---------------------------------------------------------------------------
  // Get PaymentIntent
  // ---------------------------------------------------------------------------

  @Get('intent/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recupera o PaymentIntent associado a um agendamento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PaymentIntent encontrado com sucesso.',
    type: PaymentIntentResponseDto,
  })
  async getPaymentIntent(
    @Req() req: Request,
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentIntentResponseDto> {
    const requestUser = req.user as RequestUserPayload;

    this.logger.log(
      `[PaymentsController] getPaymentIntent: userId=${requestUser.userId} bookingId=${bookingId}`,
    );

    return this.paymentsService.getPaymentIntentForBooking(
      bookingId,
      requestUser.userId,
    );
  }

  // ---------------------------------------------------------------------------
  // Withdrawal
  // ---------------------------------------------------------------------------

  @Post('withdrawal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Solicita um saque do provedor via chave PIX.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitação de saque recebida com sucesso.',
    type: MessageResponseDto,
  })
  async requestWithdrawal(
    @Req() req: Request,
    @Body() requestWithdrawalDto: RequestWithdrawalDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const requestUser = req.user as RequestUserPayload;
    const providerId = requestUser.providerId;

    this.logger.log(
      `[PaymentsController] requestWithdrawal: providerId=${providerId}`,
    );

    if (!providerId) {
      this.logger.error(
        '[PaymentsController] requestWithdrawal: providerId não encontrado no token.',
      );
      throw new InternalServerErrorException(
        'ID do provedor não disponível no token de autenticação.',
      );
    }

    return this.paymentsService.requestWithdrawal(
      providerId,
      requestWithdrawalDto,
      idempotencyKey,
    );
  }

  // ---------------------------------------------------------------------------
  // Webhooks genéricos
  // ---------------------------------------------------------------------------

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe notificações de pagamento (compra)',
  })
  async handlePaymentWebhook(
    @Headers('x-signature') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log('Webhook de Pagamento Recebido');
    return this.paymentsService.handlePaymentWebhook(signature, payload);
  }

  // ---------------------------------------------------------------------------
  // 🚨 WEBHOOK PIX — FORM-URLENCODED — SEM SEGURANÇA
  // ---------------------------------------------------------------------------

  @Post('webhook/pix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe notificações de PIX do PagBank (SEM SEGURANÇA).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook PIX recebido e processado.',
  })
  async handlePixWebhook(
    @Req() req: Request,
    @Body() webhookData: any,
  ): Promise<MessageResponseDto> {
    this.logger.log('[WEBHOOK PIX] Recebido (PagBank — URLENCODED).');

    let rawBody: string | null =
      (req as any).rawBody?.toString() ??
      (req as any).bodyRaw?.toString() ??
      null;

    if (!rawBody) {
      this.logger.warn('[Webhook PIX] rawBody estava vazio, usando fallback.');
      rawBody = typeof webhookData === 'string'
        ? webhookData
        : JSON.stringify(webhookData);
    }

    this.logger.debug(`[Webhook PIX] RAW BODY = ${rawBody}`);

    // 🔥 Converter corretamente URLENCODED → Objeto
    const parsed = Object.fromEntries(new URLSearchParams(rawBody));

    this.logger.debug(
      `[Webhook PIX] PARSED BODY = ${JSON.stringify(parsed)}`,
    );

    return this.paymentsService.handlePixWebhook(
      rawBody,       // 1
      undefined,     // 2
      parsed,        // 3
    );
  }

  // ---------------------------------------------------------------------------

  @Post('webhook/withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe notificações de webhook de saque.',
  })
  async handleWithdrawalWebhook(
    @Headers('x-signature') signature: string,
    @Headers('x-event-id') eventId: string,
    @Body() payload: any,
  ) {
    this.logger.log(
      '[PaymentsController] handleWithdrawalWebhook: received event.',
    );

    return this.paymentsService.handleWithdrawalWebhook(
      signature,
      eventId,
      payload,
    );
  }

  // ---------------------------------------------------------------------------
  // Admin endpoints
  // ---------------------------------------------------------------------------

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listTransactions(@Req() req: any) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    const type = req.query?.type as string | undefined;
    const status = req.query?.status as string | undefined;

    return this.paymentsService.listTransactions(type, status);
  }

  @Post(':transactionId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async refund(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
    @Body() body: { amount?: number },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.initiateRefund(transactionId, body?.amount);
  }

  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listWithdrawals(@Req() req: any) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.listWithdrawals(req.query?.status);
  }

  @Post('webhooks/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async registerWebhooks(
    @Req() req: any,
    @Body() body: { pixUrl?: string; payoutsUrl?: string },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.registerAllWebhooks(
      body?.pixUrl,
      body?.payoutsUrl,
    );
  }

  @Patch('withdrawals/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async approveWithdrawal(@Req() req: any, @Param('id') id: string) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async rejectWithdrawal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.rejectWithdrawal(id, body?.reason);
  }

  @Post('test-orders')
  @HttpCode(HttpStatus.OK)
  async testOrdersDirect() {
    const payload = {
      reference_id: 'test-orders-1',
      customer: {
        name: 'Rodrigo Silva',
        email: 'rods@gmail.com',
        tax_id: '39450038813',
      },
      items: [{ name: 'Teste Orders', quantity: 1, unit_amount: 500 }],
      qr_codes: [
        {
          amount: { value: 500 },
          expiration_date: new Date(Date.now() + 300000).toISOString(),
          instructions: 'Teste Orders',
        },
      ],
    };

    const fetchFn: any = (global as any).fetch;

    if (!fetchFn) {
      throw new InternalServerErrorException(
        'fetch indisponível no runtime do servidor.',
      );
    }

    const resp = await fetchFn('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAGSEGURO_API_TOKEN}`,
        'idempotency-key': 'test-orders-1',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();

    return {
      status: resp.status,
      response: text,
    };
  }
}
