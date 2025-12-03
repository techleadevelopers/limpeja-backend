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

/**
 * Interface para o payload do usuário autenticado, geralmente vindo do token JWT.
 */
interface RequestUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  clientId?: string;
  providerId?: string;
}

// -----------------------------------------------------------------------------

@ApiTags('payments') // Tag para agrupar endpoints no Swagger UI
@Controller('payments') // Define o prefixo de rota para este controlador
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name); // Logger para registrar eventos e erros

  constructor(private readonly paymentsService: PaymentsService) {} // Injeção de dependência do PaymentsService

  // --- COBRANÇAS ---

  /**
   * Cria uma nova cobrança PIX para um serviço ou provedor.
   * Apenas clientes autenticados podem gerar cobranças.
   */
  @Post('pix-charge')
  @UseGuards(JwtAuthGuard) // Protege o endpoint com autenticação JWT
  @HttpCode(HttpStatus.OK) // Retorna status 200 OK em caso de sucesso
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
    @Req() req: Request, // Acessa o objeto de requisição para obter dados do usuário
    @Body() createPixChargeDto: CreatePixChargeDto, // Corpo da requisição com os dados para criar a cobrança
  ): Promise<PixChargeResponseDto> {
    const requestUser = req.user as RequestUserPayload;
    const clientUserId = requestUser.userId;
    this.logger.log(
      `[PaymentsController] createPixCharge: userId=${clientUserId} dto=${JSON.stringify(createPixChargeDto)}`,
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

  /**
   * Recupera o PaymentIntent associado a um agendamento específico.
   */
  @Get('intent/:bookingId')
  @UseGuards(JwtAuthGuard) // Protege o endpoint com autenticação JWT
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
    @Req() req: Request, // Acessa o objeto de requisição para obter dados do usuário
    @Param('bookingId') bookingId: string, // Parâmetro de rota para o ID do agendamento
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

  // --- SAQUES (WITHDRAWALS) ---

  /**
   * Solicita um saque de valores disponíveis para um provedor via chave PIX.
   * Apenas provedores autenticados podem solicitar saques.
   */
  @Post('withdrawal')
  @UseGuards(JwtAuthGuard) // Protege o endpoint com autenticação JWT
  @HttpCode(HttpStatus.OK) // Retorna status 200 OK em caso de sucesso
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Solicita um saque de valores disponíveis para um provedor via chave PIX.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitação de saque recebida com sucesso.',
    type: MessageResponseDto,
  })
  async requestWithdrawal(
    @Req() req: Request, // Acessa o objeto de requisição para obter dados do usuário
    @Body() requestWithdrawalDto: RequestWithdrawalDto, // Corpo da requisição com os dados do saque
    @Headers('idempotency-key') idempotencyKey?: string, // Cabeçalho de idempotência opcional
  ) {
    const requestUser = req.user as RequestUserPayload;
    const providerId = requestUser.providerId;
    this.logger.log(
      `[PaymentsController] requestWithdrawal: providerId=${providerId}`,
    );
    this.logger.debug(
      `[PaymentsController] requestWithdrawal: req.user=${JSON.stringify(requestUser)}`,
    );
    if (!providerId) {
      this.logger.error(
        '[PaymentsController] requestWithdrawal: providerId não encontrado no token.',
        requestUser as any,
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

  // --- WEBHOOKS (NOTIFICAÇÕES PÚBLICAS) ---

  /**
   * Rota pública para receber notificações de pagamento do PSP (Payment Service Provider).
   */
  @Post('webhook') // Endpoint genérico para webhooks de pagamento (compra)
  @HttpCode(HttpStatus.OK) // Responda 200/204 para o PSP imediatamente.
  @ApiOperation({
    summary: 'Recebe notificações de PAGAMENTO (Compra) do PSP (Webhook)',
  })
  async handlePaymentWebhook(
    @Headers('x-signature') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log('Webhook de Pagamento Recebido');
    return this.paymentsService.handlePaymentWebhook(signature, payload);
  }

  /**
   * Webhook de PIX para receber notificações de pagamento do PagBank.
   * 🛑 SEM VERIFICAÇÃO DE SEGURANÇA HMAC.
   */
  @Post('webhook/pix')
  @HttpCode(HttpStatus.OK) // Retorna status 200 OK para o PSP
  @ApiOperation({
    summary: 'Recebe notificações de webhook de pagamento PIX. (SEM SEGURANÇA)',
    description: 'Chamado pelo PSP para notificar status de uma transação PIX.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook recebido e processado.',
  })
  async handlePixWebhook(
    // 🛑 REMOVIDA A LEITURA DO x-signature AQUI
    @Headers('x-event-id') eventId: string, // MANTENDO APENAS O eventId, se necessário
    @Body() webhookData: any, // Corpo da requisição com os dados do webhook
    @Req() req: Request, // Mantido apenas para acessar o objeto de requisição (se necessário)
  ): Promise<MessageResponseDto> {
    this.logger.log(
      `[WEBHOOK PIX - PORTA DE ENTRADA] Tentativa de acesso. EventID: ${eventId || 'N/A'}.`,
    );

    try {
      return await this.paymentsService.handlePixWebhook(
        undefined, // Passando undefined para 'signature' (desativando verificação HMAC)
        eventId, // Passando o eventId
        webhookData,
        undefined, // Passando undefined para 'rawBody' (desativando verificação HMAC)
      );
    } catch (error: any) {
      this.logger.error(
        'Erro ao processar webhook PIX no controller:',
        error?.message,
        error?.stack,
      );
      // Retorna 200 OK para evitar reenvio repetido do PSP
      return {
        message:
          'Erro interno ao processar webhook PIX, mas o erro foi logado.',
      };
    }
  }

  /**
   * Webhook de saque/withdrawal para receber notificações do PSP sobre o status de saques.
   * ⚠️ Nota: Este endpoint AINDA espera a verificação de assinatura no Service.
   */
  @Post('webhook/withdrawal')
  @HttpCode(HttpStatus.OK) // Retorna status 200 OK para o PSP
  @ApiOperation({ summary: 'Recebe notificações de webhook de saque.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook de saque recebido e processado.',
  })
  async handleWithdrawalWebhook(
    @Headers('x-signature') signature: string, // Cabeçalho para verificação da assinatura do webhook
    @Headers('x-event-id') eventId: string, // Cabeçalho com o ID do evento
    @Body() payload: any, // Corpo da requisição com os dados do webhook
  ) {
    this.logger.log(
      '[PaymentsController] handleWithdrawalWebhook: received event from PSP.',
    );
    // Este método é provavelmente usado pelo `PayoutsService` (se você seguiu a estrutura anterior).
    // Aqui, ele assume que o PaymentsService tratará a verificação de segurança.
    return this.paymentsService.handleWithdrawalWebhook(
      signature,
      eventId,
      payload,
    );
  }

  // --- ROTAS ADMINISTRATIVAS (ADMIN) ---

  /**
   * ADMIN: Lista todas as transações.
   */
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista transações (admin)' })
  async listTransactions(@Req() req: any) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only'); // Verifica a função do usuário
    const type = req.query?.type as string | undefined; // Filtro opcional por tipo
    const status = req.query?.status as string | undefined; // Filtro opcional por status
    return this.paymentsService.listTransactions(type, status);
  }

  /**
   * ADMIN: Inicia o processo de reembolso para uma transação específica.
   */
  @Post(':transactionId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inicia reembolso (admin)' })
  async refund(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
    @Body() body: { amount?: number },
  ) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');
    return this.paymentsService.initiateRefund(transactionId, body?.amount);
  }

  /**
   * ADMIN: Lista todas as solicitações de saque.
   */
  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista solicitações de saque (admin)' })
  async listWithdrawals(@Req() req: any) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');
    const status = req.query?.status as string | undefined;
    return this.paymentsService.listWithdrawals(status);
  }

  /**
   * ADMIN: Registra webhooks de PIX e Payouts no PagBank.
   */
  @Post('webhooks/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registra webhooks de PIX e Payouts no PagBank (admin)',
  })
  async registerWebhooks(
    @Req() req: any,
    @Body() body: { pixUrl?: string; payoutsUrl?: string },
  ) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');
    return this.paymentsService.registerAllWebhooks(
      body?.pixUrl,
      body?.payoutsUrl,
    );
  }

  /**
   * ADMIN: Aprova uma solicitação de saque.
   */
  @Patch('withdrawals/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprova solicitação de saque (admin)' })
  async approveWithdrawal(@Req() req: any, @Param('id') id: string) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');
    return this.paymentsService.approveWithdrawal(id);
  }

  /**
   * ADMIN: Rejeita uma solicitação de saque.
   */
  @Patch('withdrawals/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rejeita solicitação de saque (admin)' })
  async rejectWithdrawal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const role = req.user?.role;
    if (role !== 'ADMIN')
      throw new InternalServerErrorException('Admin only');
    return this.paymentsService.rejectWithdrawal(id, body?.reason);
  }

  // --- TESTE ---

  /**
   * Endpoint de teste para criar uma ordem de pagamento diretamente com o PagBank (Orders API).
   */
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

    // Verifica se a função fetch está disponível no ambiente de execução.
    const fetchFn: any = (global as any).fetch;
    if (!fetchFn) {
      throw new InternalServerErrorException(
        'fetch indisponível no runtime do servidor.',
      );
    }

    // Faz a requisição para a API de Orders do PagBank.
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