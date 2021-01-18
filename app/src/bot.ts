import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {MessageHandler} from "./messages/message-handler";
import {CompoundMessageHandler} from "./messages/compound-message-handler";

@injectable()
export class Bot {

  private client: Client;
  private messageHandlers: CompoundMessageHandler;
  private readonly token: string;
  private readonly qualifier: string;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageHandler) messageHandlers: CompoundMessageHandler,
    @inject(TYPES.Qualifier) qualifier: string
  ) {
    this.client = client;
    this.token = token;
    this.messageHandlers = messageHandlers;
    this.qualifier = qualifier;
  }

  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => this.handleMessage(message));

    return this.client.login(this.token);
  }

  private handleMessage(message: Message): void {
    if (message.author.bot) {
      console.log('Ignoring bot messages...');
      return;
    }

    console.log('Message received! Contents: ' + message.content);

    this.messageHandlers.handleMessage(message).then(() => {
      console.log('Handled!');
    }).catch(() => {
      console.log('Not handled :(');
    });
  }
}
