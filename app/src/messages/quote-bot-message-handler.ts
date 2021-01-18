import {Message} from "discord.js";
import {MessageHandler} from "./message-handler";
import {CompoundMessageHandler} from "./compound-message-handler";
import {injectable, inject} from "inversify";
import {TYPES} from "../types";

@injectable()
export class QuoteBoteMessageHandler implements CompoundMessageHandler {
  private messageHandlers: MessageHandler[];
  private qualifier: string;

  constructor(
    @inject(TYPES.MessageHandlers) messageHandlers: MessageHandler[],
    @inject(TYPES.Qualifier) qualifier: string
  ) {
    this.messageHandlers = messageHandlers;
    this.qualifier = qualifier;
  }

  handleMessage(message: Message): Promise<Message | Message[]> {
    console.log(this.qualifier);
    console.log(message.content);
    if (!message.content.startsWith(this.qualifier)) {
      return Promise.reject();
    }

    for (let handler of this.messageHandlers) {
      if (handler.identify(message)) {
        return handler.handle(message);
      }
    }
    return Promise.reject();
  }
}
