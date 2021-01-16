import {Client, Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";

@injectable()
export class Bot {

  private client: Client;
  private readonly token: string;

  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string
  ) {
    this.client = client;
    this.token = token;
  }

  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => {
      console.log('Message received! Contents: ' + message.content);
      console.log('Entire message:');
      console.log(message);
    });

    return this.client.login(this.token);
  }
}
