import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrdersRepository } from './orders.repository';
import { CreateOrderReq } from './dto/create-order.req';
import { BILLING_SERVICE, ORDER_CREATED } from '@app/common';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}
  async createOrder(request: CreateOrderReq) {
    const session = await this.ordersRepository.startTransaction();
    try {
      const order = await this.ordersRepository.create(request, { session });
      await lastValueFrom(
        this.billingClient.emit(ORDER_CREATED, {
          request,
        }),
      );
      session.commitTransaction();
      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
  }

  async getOrders() {
    return this.ordersRepository.find({});
  }
}
