import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";

@injectable()
export class MessageHandler {
  handle(message: Message): Promise<Message | Message[]> {
    if (message.content.search('!') >= 0) {
      return message.reply('pong!');
    }

    return Promise.reject();
  }
}
