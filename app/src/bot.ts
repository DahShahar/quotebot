import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Client, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { CompoundMessageHandler } from './messages';

@injectable()
export class Bot {
  private client: Client;
  private messageHandlers: CompoundMessageHandler;
  private token: string;

  constructor(
    @inject(TYPES.DiscordClient) client: Client,
    @inject(TYPES.MessageHandler) messageHandlers: CompoundMessageHandler,
    @inject(TYPES.Token) token?: string
  ) {
    this.client = client;
    this.messageHandlers = messageHandlers;
    if (token) {
      this.token = token;
    } else {
      this.token = '';
    }
  }

  public async listen(): Promise<string> {
    if (this.token === '') {
      await this.getToken(new SSMClient({}));
    }

    this.client.on('message', (message: Message) => this.handleMessage(message));

    return this.client.login(this.token);
  }

  async getToken(ssmClient: SSMClient) {
    const getParamCommand = new GetParameterCommand({
      Name: '/quoteBot/token',
    });
    const param = await ssmClient.send(getParamCommand);
    if (param.Parameter && param.Parameter.Value) {
      console.log('Set Parameter Value from SSM');
      this.token = param.Parameter.Value;
    }
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
