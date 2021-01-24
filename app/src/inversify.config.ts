import 'reflect-metadata';
import {Container} from 'inversify';
import {TYPES} from './types';
import {Bot} from './bot';
import {MessageHandler} from './messages/message-handler';
import {EchoHandler} from './messages/echo-handler';
import {AddQuoteHandler} from './messages/add-quote-handler';
import {GetQuoteHandler} from './messages/get-quote-handler';
import {CompoundMessageHandler} from './messages/compound-message-handler';
import {QuoteBotMessageHandler} from './messages/quote-bot-message-handler';
import {QuoteManager} from './quotes/quote-manager';
import {InMemoryQuoteManager} from './quotes/in-memory-quote-manager';
import {Client} from 'discord.js';

function stringOrThrow(check: string | undefined) : string {
  if (check !== null && check !== undefined) {
    return check;
  }
  throw new Error('Expected to find a string, was not');
}

const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(stringOrThrow(process.env.TOKEN));
container.bind<string>(TYPES.Qualifier).toConstantValue(stringOrThrow(process.env.QUALIFIER));

container.bind<QuoteManager>(TYPES.QuoteManager).to(InMemoryQuoteManager).inSingletonScope();

const messageHandlers: MessageHandler[] = [
  new EchoHandler(),
  new AddQuoteHandler(container.get(TYPES.QuoteManager)),
  new GetQuoteHandler(container.get(TYPES.QuoteManager)),
];

container.bind<MessageHandler[]>(TYPES.MessageHandlers).toConstantValue(messageHandlers);

container.bind<CompoundMessageHandler>(TYPES.MessageHandler).to(QuoteBotMessageHandler).inSingletonScope();

export default container;
