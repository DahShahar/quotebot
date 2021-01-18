import {Message} from "discord.js";
import {MessageHandler} from "./message-handler";
import {CompoundMessageHandler} from "./compound-message-handler";
import {injectable, inject} from "inversify";
import {TYPES} from "../types";

@injectable()
export class QuoteBoteMessageHandler implements CompoundMessageHandler {
  private messageHandlers: MessageHandler[];

  constructor(
    @inject(TYPES.MessageHandlers) messageHandlers: MessageHandler[]
  ) {
    this.messageHandlers = messageHandlers;
  }

  handleMessage(message: Message): Promise<Message | Message[]> {
    for (let handler of this.messageHandlers) {
      if (handler.identify(message)) {
        return handler.handle(message);
      }
    }
    return Promise.reject();
  }
}
