import { Message } from 'discord.js';
import { MessageHandler } from './message-handler';
import { injectable } from 'inversify';

@injectable()
export class EchoHandler implements MessageHandler {
  getIdentifier(): string {
    return 'echo';
  }

  getUsage(): string {
    return `${this.getIdentifier()} [words]: repeats [words] right back to you`;
  }

  handle(content: string, message: Message): Promise<Message | Message[]> {
    return message.reply(content);
  }
}
