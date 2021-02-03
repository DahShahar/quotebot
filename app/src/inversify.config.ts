import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { Bot } from './bot';
import { Quote } from './quotes/quote';
import { MessageHandler } from './messages/message-handler';
import { EchoHandler } from './messages/echo-handler';
import { AddQuoteHandler } from './messages/add-quote-handler';
import { BlameQuoteHandler } from './messages/blame-quote-handler';
import { GetQuoteHandler } from './messages/get-quote-handler';
import { QuoteItHandler } from './messages/quote-it-handler';
import { CompoundMessageHandler } from './messages/compound-message-handler';
import { QuoteBotMessageHandler } from './messages/quote-bot-message-handler';
import { BasicQuoteFormatter } from './quotes/basic-quote-formatter';
import { BlameQuoteFormatter } from './quotes/blame-quote-formatter';
import { QuoteFormatter } from './quotes/quote-formatter';
import { QuoteManager } from './quotes/quote-manager';
import { InMemoryQuoteManager } from './quotes/in-memory-quote-manager';
import { Client } from 'discord.js';

function stringOrThrow(check: string | undefined, errorMessage: string): string {
  if (check !== null && check !== undefined) {
    return check;
  }
  throw new Error(errorMessage);
}

const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(stringOrThrow(process.env.TOKEN, 'Could not find TOKEN'));
container
  .bind<string>(TYPES.Qualifier)
  .toConstantValue(stringOrThrow(process.env.QUALIFIER, 'Could not find QUALIFIER'));

container.bind<QuoteFormatter>(TYPES.BasicQuoteFormatter).to(BasicQuoteFormatter).inSingletonScope();
container.bind<QuoteFormatter>(TYPES.BlameQuoteFormatter).to(BlameQuoteFormatter).inSingletonScope();

container.bind<Map<number, Quote>>(TYPES.QuoteMapping).toConstantValue(new Map<number, Quote>());

container.bind<QuoteManager>(TYPES.QuoteManager).to(InMemoryQuoteManager).inSingletonScope();

const messageHandlers: MessageHandler[] = [
  new EchoHandler(),
  new AddQuoteHandler(container.get(TYPES.QuoteManager)),
  new GetQuoteHandler(container.get(TYPES.QuoteManager), container.get(TYPES.BasicQuoteFormatter)),
  new BlameQuoteHandler(container.get(TYPES.QuoteManager), container.get(TYPES.BlameQuoteFormatter)),
  new QuoteItHandler(container.get(TYPES.QuoteManager)),
];

container.bind<MessageHandler[]>(TYPES.MessageHandlers).toConstantValue(messageHandlers);

container.bind<CompoundMessageHandler>(TYPES.MessageHandler).to(QuoteBotMessageHandler).inSingletonScope();

export default container;
