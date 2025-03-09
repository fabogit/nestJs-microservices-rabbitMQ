import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { ORDER_CREATED, RmqService } from '@app/common';

/**
 * Controller for handling billing-related events.
 * This controller is responsible for listening to and processing specific events,
 * particularly the `ORDER_CREATED` event, to trigger billing operations.
 * It uses RabbitMQ as the transport layer for event-based communication.
 */
@Controller()
export class BillingController {
  /**
   * Constructor for BillingController.
   * @param {BillingService} billingService - Injected BillingService instance.
   *        Provides the core billing logic to be executed upon receiving relevant events.
   * @param {RmqService} rmqService - Injected RmqService instance.
   *        Provides utility functions for RabbitMQ, specifically for acknowledging messages.
   */
  constructor(
    private readonly billingService: BillingService,
    private readonly rmqService: RmqService,
  ) {}

  /**
   * Handles the `ORDER_CREATED` event.
   * This method is decorated with `@EventPattern(ORDER_CREATED)`, making it a listener for messages
   * on the RabbitMQ exchange matching the `ORDER_CREATED` pattern. When an order creation event is received,
   * this method processes the billing for the created order and acknowledges the message to RabbitMQ.
   * @EventPattern(ORDER_CREATED) Decorator that specifies this method as an event handler for the 'ORDER_CREATED' pattern.
   * @param {any} data - The payload of the incoming RabbitMQ message, expected to contain order creation data.
   * @Payload() Decorator that extracts the message payload from the RmqContext.
   * @param {RmqContext} context - The RmqContext object provided by NestJS, containing context information about the incoming RabbitMQ message, including the channel and original message.
   * @Ctx() Decorator that injects the RmqContext object.
   * @async
   * @returns A Promise that resolves after processing the order creation event and acknowledging the message.
   */
  @EventPattern(ORDER_CREATED)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.billingService.bill(data); // Delegates the billing processing to the BillingService, passing the received order data.
    this.rmqService.ack(context); // Acknowledges the RabbitMQ message to confirm successful processing and remove it from the queue.
  }
}
