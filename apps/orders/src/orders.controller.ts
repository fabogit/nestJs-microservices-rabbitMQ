import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderReq } from './dto/create-order.req';
import { JwtAuthGuard } from '@app/common';
import { Order } from './models/order.schema';

/**
 * Controller for handling order-related API endpoints.
 * This controller manages operations related to orders, such as creating new orders and retrieving existing orders.
 * It exposes endpoints under the '/orders' route and utilizes the OrdersService for business logic.
 * @Controller('orders') Decorator that sets the base route for this controller to '/orders'.
 */
@Controller('orders')
export class OrdersController {
  /**
   * Constructor for OrdersController.
   * @param {OrdersService} ordersService - Injected OrdersService instance.
   *        Provides the business logic for order operations like creating and retrieving orders.
   */
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint to create a new order.
   * This endpoint is secured with `JwtAuthGuard`, ensuring only authenticated users can create orders.
   * @Post() Decorator that maps this method to handle POST requests to '/orders'.
   * @UseGuards(JwtAuthGuard) Decorator that applies the JwtAuthGuard to this endpoint, protecting it to only authenticated users.
   *        Note: This guard is imported from the `@app/common` library, indicating a shared authentication guard module.
   * @param {CreateOrderReq} body - The request body containing order creation details.
   *        @Body() Decorator that extracts and validates the request body, expecting a `CreateOrderReq` object.
   *        `CreateOrderReq` is a Data Transfer Object (DTO) defining the structure for creating an order.
   * @param {Request} request - The request object, automatically injected by NestJS.
   *        @Req() Decorator that injects the request object, providing access to request-specific data, such as cookies or headers.
   *        In this case, it is used to potentially access authentication information, although the user information is typically handled by the `JwtAuthGuard`.
   * @returns {Promise<Order>} A Promise that resolves to the newly created Order object.
   *
   * @example
   * Request Body (example `CreateOrderReq`):
   * ```json
   * {
   *   "name": "Laptop",
   *   "price": 1200,
   *   "phoneNumber": "01234"
   * }
   * ```
   *
   * Response Body (example `Order`):
   * ```json
   * {
   *   "_id": "654c1e6a7b1e9b7b5d3a0e1a",
   *   "name": "Laptop",
   *   "price": 1200,
   *   "phoneNumber": "01234",
   * }
   * ```
   */
  @Post()
  @UseGuards(JwtAuthGuard) // Applying JwtAuthGuard to secure this endpoint
  async createOrder(
    @Body() body: CreateOrderReq,
    @Req() request: any,
  ): Promise<Order> {
    console.log(request.user);
    return this.ordersService.createOrder(
      body,
      // Passing the Authentication cookie, although JWT guard should handle authentication, cookie might be used for context or further processing.
      request.cookies?.Authentication,
    );
  }

  /**
   * Endpoint to retrieve all orders.
   * This endpoint is currently open and does not require authentication.
   * @Get() Decorator that maps this method to handle GET requests to `/orders`.
   * @returns {Promise<Order[]>} A Promise that resolves to an array of `Order` objects, representing all orders in the system.
   *
   * @example
   * Response Body (example `Order[]`):
   * ```json
   * [
   *   {
   *     "_id": "654c1e6a7b1e9b7b5d3a0e1a",
   *     "name": "Laptop",
   *     "price": 1200,
   *     "phoneNumber": "01234",
   *   },
   *   {
   *     "_id": "654c1e7c7b1e9b7b5d3a0e1b",
   *     "name": "Keyboard",
   *     "price": 75,
   *     "phoneNumber": "56789",
   *   }
   * ]
   * ```
   */
  @Get()
  async getOrders(): Promise<Order[]> {
    return this.ordersService.getOrders();
  }
}
