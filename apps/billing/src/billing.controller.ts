import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { ORDER_CREATED, RmqService } from '@app/common';

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern(ORDER_CREATED)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.billingService.bill(data);
    this.rmqService.ack(context);
  }
}
