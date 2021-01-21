import {Message} from 'discord.js';

export interface MessageHandler {
  identify(message: Message): boolean;
  handle(message: Message): Promise<Message | Message[]>;
}
