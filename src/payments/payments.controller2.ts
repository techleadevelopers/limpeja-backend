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
  Res,
  Header,
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
import { Request, Response } from 'express';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { UserRole } from '@prisma/client';

interface RequestUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  clientId?: string;
  providerId?: string;
}

type PagSeguroWebhookPayload = {
  event?: string;
  transaction?: { status?: string; reference_id?: string; id?: string };
  data?: {
    id?: string;
    resource_id?: string;
    transaction?: { status?: string; id?: string; reference_id?: string };
  };
  resource_id?: string;
  reference_id?: string;
};

interface AuthenticatedRequest extends Request {
  user?: RequestUserPayload;
  rawBody?: Buffer | string;
  bodyRaw?: Buffer | string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // ===========================================================================
  // Create PIX Charge
  // ===========================================================================
  @Post('pix-charge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova cobrança PIX.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PixChargeResponseDto,
  })
  async createPixCharge(
    @Req() req: Request,
    @Body() createPixChargeDto: CreatePixChargeDto,
  ): Promise<PixChargeResponseDto> {
    const requestUser = req.user as RequestUserPayload;
    const clientUserId = requestUser.userId;

    if (!clientUserId) {
      throw new InternalServerErrorException(
        'ID do usuário não disponível no token.',
      );
    }

    return this.paymentsService.createPixCharge(
      clientUserId,
      createPixChargeDto,
    );
  }

  // ===========================================================================
  // Get PaymentIntent
  // ===========================================================================
  @Get('intent/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera o PaymentIntent de um agendamento.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaymentIntentResponseDto,
  })
  async getPaymentIntent(
    @Req() req: Request,
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentIntentResponseDto> {
    const requestUser = req.user as RequestUserPayload;

    return this.paymentsService.getPaymentIntentForBooking(
      bookingId,
      requestUser.userId,
    );
  }

  // ===========================================================================
  // Withdrawal
  // ===========================================================================
  @Post('withdrawal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicita saque via chave PIX.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MessageResponseDto,
  })
  async requestWithdrawal(
    @Req() req: Request,
    @Body() requestWithdrawalDto: RequestWithdrawalDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const requestUser = req.user as RequestUserPayload;
    const providerId = requestUser.providerId;

    if (!providerId) {
      throw new InternalServerErrorException(
        'ID do provedor não disponível no token.',
      );
    }

    return this.paymentsService.requestWithdrawal(
      providerId,
      requestWithdrawalDto,
      idempotencyKey,
    );
  }

  // ===========================================================================
  // Webhook pagamentos
  // ===========================================================================
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook de pagamentos (orders/charges).' })
  async handlePaymentWebhook(
    @Headers('x-signature') signature: string,
    @Body() payload: PagSeguroWebhookPayload,
  ) {
    return this.paymentsService.handlePaymentWebhook(signature, payload);
  }

  // ===========================================================================
  // Webhook PIX PagBank — RAW (URLENCODED)
  // ===========================================================================
  @Post('webhook/pix')
  @Header('Content-Type', 'application/json')
  @HttpCode(HttpStatus.OK)
  public async handlePixWebhook(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const rawBodyInput = req.rawBody ?? req.bodyRaw ?? '';
    const rawBody =
      typeof rawBodyInput === 'string'
        ? rawBodyInput
        : rawBodyInput.toString('utf8');

    let parsed: Record<string, unknown> = {};
    try {
      // Se vier Buffer → converte pra string antes
      const text = Buffer.isBuffer(rawBody)
        ? rawBody.toString('utf8')
        : rawBody;

      // 1 → tenta JSON normalmente
      const parsedJson: unknown = JSON.parse(text);
      if (isRecord(parsedJson)) {
        parsed = parsedJson;
      }
      console.log('[Webhook PIX] JSON parseado com sucesso');
      console.log('>>> WEBHOOK PARSED:', parsed);
    } catch {
      console.log('[Webhook PIX] JSON inválido → usando string bruta');

      // 2 → tenta transformar form-data URL-encoded para objeto
      parsed = Object.fromEntries(new URLSearchParams(rawBody ?? ''));
    }
    const result = await this.paymentsService.handlePixWebhook(rawBody, parsed);

    return res.status(200).json(result);
  }
  // ===========================================================================
  // Webhook Withdrawal
  // ===========================================================================
  @Post('webhook/withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de notificações de saque.',
  })
  async handleWithdrawalWebhook(
    @Headers('x-signature') signature: string,
    @Headers('x-event-id') eventId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.paymentsService.handleWithdrawalWebhook(
      signature,
      eventId,
      payload,
    );
  }

  // ===========================================================================
  // Admin — Listar transações
  // ===========================================================================
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listTransactions(@Req() req: AuthenticatedRequest) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    const { type, status } = req.query as {
      type?: string;
      status?: string;
    };

    return this.paymentsService.listTransactions(type, status);
  }

  // ===========================================================================
  // Admin — Refund
  // ===========================================================================
  @Post(':transactionId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async refund(
    @Req() req: AuthenticatedRequest,
    @Param('transactionId') transactionId: string,
    @Body() body: { amount?: number },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.initiateRefund(transactionId, body?.amount);
  }

  // ===========================================================================
  // Admin — List Withdrawals
  // ===========================================================================
  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listWithdrawals(@Req() req: AuthenticatedRequest) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    const { status } = req.query as { status?: string };

    return this.paymentsService.listWithdrawals(status);
  }

  // ===========================================================================
  // Admin — Register Webhooks PagBank
  // ===========================================================================
  @Post('webhooks/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async registerWebhooks(
    @Req() req: AuthenticatedRequest,
    @Body() body: { pixUrl?: string; payoutsUrl?: string },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.registerAllWebhooks(
      body?.pixUrl,
      body?.payoutsUrl,
    );
  }

  // ===========================================================================
  // Admin — Aprovar/Rejeitar Saque
  // ===========================================================================
  @Patch('withdrawals/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async approveWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.approveWithdrawal(id);
  }

  @Patch('withdrawals/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async rejectWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    if (req.user?.role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');

    return this.paymentsService.rejectWithdrawal(id, body?.reason);
  }

  // ===========================================================================
  // Test Orders
  // ===========================================================================
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

    const resp = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAGSEGURO_API_TOKEN}`,
        'idempotency-key': 'test-orders-1',
      },
      body: JSON.stringify(payload),
    });

    return {
      status: resp.status,
      response: await resp.text(),
    };
  }
}
