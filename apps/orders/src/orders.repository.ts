import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { Order } from './models/order.schema';

@Injectable()
export class OrdersRepository extends AbstractRepository<Order> {
  protected readonly logger = new Logger(OrdersRepository.name, {
    timestamp: true,
  });
  constructor(
    @InjectModel(Order.name) orderModel: Model<Order>,
    @InjectConnection() connection: Connection,
  ) {
    super(orderModel, connection);
  }
}
