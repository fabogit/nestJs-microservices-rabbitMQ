import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

/**
 * Injectable service for providing RabbitMQ connection options.
 * This service encapsulates the logic for generating configurations needed to connect to RabbitMQ,
 * leveraging the `ConfigService` to retrieve necessary connection details from the application's configuration.
 */
@Injectable()
export class RmqService {
  /**
   * Constructor for RmqService.
   * @param {ConfigService} configService - Injected `ConfigService` instance.
   * The `ConfigService` is used to access application-wide configuration variables, specifically for RabbitMQ settings.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates and returns RabbitMQ connection options for a given `queue`.
   * This method constructs an `RmqOptions` object, which is used by NestJS microservices to establish
   * a connection with RabbitMQ. It retrieves connection URLs and queue names from the `ConfigService`.
   * @param queue - The name of the RabbitMQ queue for which to generate options. This is used to dynamically determine the queue name from the configuration.
   * @param [acknowledgements=false] - Optional parameter to determine if message acknowledgements should be disabled (`noAck: true`). Defaults to `false`, meaning acknowledgements are enabled by default.
   * @returns {RmqOptions} An `RmqOptions` object configured with connection details for RabbitMQ, ready to be used in a NestJS microservice client or listener.
   */
  getOptions(queue: string, acknowledgements = false): RmqOptions {
    return {
      // Specifies the transport protocol as RabbitMQ
      transport: Transport.RMQ,
      options: {
        // Retrieves the RabbitMQ connection URI from the configuration
        urls: [this.configService.get<string>('RABBIT_MQ_URI')],
        // Dynamically retrieves the queue name from configuration based on the provided queue parameter
        queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`),
        // Sets whether message acknowledgements are enabled or disabled. When true, acknowledgements are disabled.
        noAck: acknowledgements,
        // Configures messages to be persistent, ensuring they survive broker restarts.
        persistent: true,
      },
    };
  }

  /**
   * Acknowledges a RabbitMQ message.
   * This method manually acknowledges a message in RabbitMQ to confirm successful processing.
   * It extracts the channel and original message from the `RmqContext` to perform the acknowledgement.
   * @param {RmqContext} context - The `RmqContext` object provided by NestJS, containing channel and message details.
   */
  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
