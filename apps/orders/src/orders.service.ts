import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrdersRepository } from './orders.repository';
import { CreateOrderReq } from './dto/create-order.req';
import { BILLING_SERVICE, ORDER_CREATED } from '@app/common';
import { Order } from './models/order.schema';

/**
 * Injectable service for managing orders within the application.
 * This service handles order creation, retrieval, and interactions with the billing microservice.
 */
@Injectable()
export class OrdersService {
  /**
   * Constructor for OrdersService.
   * @param {OrdersRepository} ordersRepository - Injected OrdersRepository instance.
   *        Provides data access methods for Order entities, interacting with the database.
   * @param {ClientProxy} billingClient - Injected ClientProxy for the BILLING_SERVICE.
   *        Enables communication with the billing microservice to trigger billing events.
   * @Inject(BILLING_SERVICE) - Inject decorator to obtain the ClientProxy configured for BILLING_SERVICE.
   */
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  /**
   * Creates a new order and initiates the billing process.
   * This method starts a database transaction to ensure atomicity, creates the order in the database,
   * emits an 'ORDER_CREATED' event to the billing microservice, and commits the transaction upon success.
   * If any error occurs, it aborts the transaction and propagates the error.
   * @async
   * @param {CreateOrderReq} request - Data transfer object containing the details of the order to be created.
   * @returns {Promise<Order>} A Promise that resolves to the newly created Order object.
   * @throws {Error} If any error occurs during order creation or billing event emission, the transaction is aborted and the error is thrown.
   */
  async createOrder(request: CreateOrderReq): Promise<Order> {
    // Start a new database transaction
    const session = await this.ordersRepository.startTransaction();
    try {
      // Create the order document in the database within the transaction
      const order = await this.ordersRepository.create(request, { session });
      // Emit an ORDER_CREATED event to the billing microservice via RabbitMQ
      await lastValueFrom(
        // Use clientProxy to emit the event
        this.billingClient.emit(ORDER_CREATED, {
          // Pass the order creation request as payload
          request,
        }),
      );
      // Commit the transaction if both order creation and event emission are successful
      session.commitTransaction();
      return order;
    } catch (err) {
      // Abort the transaction if any error occurred
      await session.abortTransaction();
      throw err;
    }
  }

  /**
   * Retrieves all orders from the database.
   * @async
   * @returns {Promise<Order[]>} A Promise that resolves to an array of Order objects representing all orders in the database.
   */
  async getOrders(): Promise<Order[]> {
    return this.ordersRepository.find({});
  }
}
