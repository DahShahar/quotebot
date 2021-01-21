import {Message} from 'discord.js';

export interface CompoundMessageHandler {
  handleMessage(message: Message): Promise<Message | Message[]>;
}
