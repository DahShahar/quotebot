import { readFileSync, writeFileSync } from 'fs';
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

const QUOTE_MAPPING_PATH = './quoteMapping.json';

function stringOrThrow(check: string | undefined, errorMessage: string): string {
  if (check !== null && check !== undefined) {
    return check;
  }
  throw new Error(errorMessage);
}

function flushJson(path: string, mapping: Map<any, any>) {
  try {
    writeFileSync(path, JSON.stringify(Object.fromEntries(mapping)));
  } catch (err) {
    console.log(err);
  }
}

function loadMappingFromFile(path: string): Map<number, Quote> {
  try {
    const jsonMap = new Map<string, Quote>(Object.entries(JSON.parse(readFileSync(path, 'utf8'))));
    const mapping = new Map<number, Quote>();
    jsonMap.forEach((value, key) => {
      mapping.set(parseInt(key), value);
    });
    console.log('Loaded mapping from file!');
    console.log(mapping);
    return mapping;
  } catch (err) {
    console.error('Could not find file');
    return new Map<number, Quote>();
  }
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

const quoteMapping: Map<number, Quote> = loadMappingFromFile(QUOTE_MAPPING_PATH);
container.bind<Map<number, Quote>>(TYPES.QuoteMapping).toConstantValue(quoteMapping);

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

[
  'beforeExit',
  'uncaughtException',
  'unhandledRejection',
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGUSR1',
  'SIGSEGV',
  'SIGUSR2',
  'SIGTERM',
].forEach((event) =>
  process.on(event, (evt) => {
    flushJson(QUOTE_MAPPING_PATH, quoteMapping);
    console.log('Flushed Json to file');
    console.log(readFileSync(QUOTE_MAPPING_PATH, 'utf8'));
    process.exit();
  })
);

export default container;
