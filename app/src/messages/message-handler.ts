import {Message} from 'discord.js';

export interface MessageHandler {
  getIdentifier(): string;
  identify(message: Message): boolean;
  handle(message: Message): Promise<Message | Message[]>;
}
