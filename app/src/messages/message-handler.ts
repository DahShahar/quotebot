import { Message } from 'discord.js';

export interface MessageHandler {
  getIdentifier(): string;
  handle(message: Message): Promise<Message | Message[]>;
}
