import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqService } from './rmq.service';

/**
 * Interface defining the options for registering the `RmqModule`.
 * It specifies the name used to identify the RabbitMQ client.
 */
interface RmqModuleOptions {
  /**
   * The `name` of the RabbitMQ client. This name is used to configure and inject the client.
   */
  name: string;
}

/**
 * Module for providing RabbitMQ client and service functionalities.
 * This module offers a dynamic registration feature, allowing to create and configure RabbitMQ clients on-demand
 * based on provided options, primarily used for microservice communication via RabbitMQ.
 * It exports both the `RmqService` and `ClientsModule` to make RabbitMQ functionalities available to other modules.
 * @exports {RmqModule} Exports the `RmqModule` class, making it available for import in other modules.
 */
@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  /**
   * Registers the `RmqModule` dynamically, creating a configured RabbitMQ client.
   * This static method allows for dynamic configuration of the RabbitMQ client based on the options provided.
   * It sets up a `ClientsModule` with asynchronous registration to utilize `ConfigService` for configuration.
   * @static
   * @param {RmqModuleOptions} options Options to configure the `RmqModule`, including the client `name`.
   * @returns {DynamicModule} A dynamically configured NestJS module.
   */
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            /**
             * Factory function to create the RabbitMQ client configuration asynchronously.
             * It utilizes the `ConfigService` to fetch configuration values for RabbitMQ connection details,
             * such as the URI and queue name, from the application's configuration.
             * @param {ConfigService} config The `ConfigService` instance injected for configuration access.
             * @returns An object containing the `transport` and `options` for the RabbitMQ client.
             */
            useFactory: (config: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [config.get<string>('RABBIT_MQ_URI')],
                queue: config.get<string>(`RABBIT_MQ_${name}_QUEUE`),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      // Export ClientsModule to make the registered client available for injection
      exports: [ClientsModule],
    };
  }
}
