import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { CompoundMessageHandler } from './messages/compound-message-handler';

@injectable()
export class Bot {
  private client: Client;
  private messageHandlers: CompoundMessageHandler;
  private readonly token: string;

  constructor(
    @inject(TYPES.DiscordClient) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageHandler) messageHandlers: CompoundMessageHandler
  ) {
    this.client = client;
    this.token = token;
    this.messageHandlers = messageHandlers;
  }

  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => this.handleMessage(message));

    return this.client.login(this.token);
  }

  private handleMessage(message: Message): void {
    this.messageHandlers
      .handleMessage(message)
      .then(() => {
        console.log('Handled!');
      })
      .catch(() => {
        console.log('Not handled :(');
      });
  }
}
