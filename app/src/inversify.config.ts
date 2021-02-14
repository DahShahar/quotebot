import { Client } from 'discord.js';
import 'reflect-metadata';
import { Container } from 'inversify';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SSMClient } from '@aws-sdk/client-ssm';

import { TYPES } from './types';
import { Bot } from './bot';
import { MessageHandler } from './messages/message-handler';
import { EchoHandler } from './messages/echo-handler';
import { AddQuoteHandler } from './messages/add-quote-handler';
import { BlameQuoteHandler } from './messages/blame-quote-handler';
import { GetQuoteHandler } from './messages/get-quote-handler';
import { QuoteItHandler } from './messages/quote-it-handler';
import { CompoundMessageHandler } from './messages/compound-message-handler';
import { QuoteBotMessageHandler } from './messages/quote-bot-message-handler';
import {
  QuoteManager,
  InMemoryQuoteManager,
  DdbQuoteManager,
  QuoteFormatter,
  BasicQuoteFormatter,
  BlameQuoteFormatter,
} from './quotes';

const QUOTE_MAPPING_PATH = 'quoteMapping.json';

function stringOrThrow(check: string | undefined, errorMessage: string): string {
  if (check !== null && check !== undefined) {
    return check;
  }
  throw new Error(errorMessage);
}

function useInMemoryQuoteManager() {
  return false;
}

const container = new Container();

const cfnClient = new CloudFormationClient({});

container.bind<Client>(TYPES.DiscordClient).toConstantValue(new Client());

if (process.env.TOKEN) {
  container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
}

container
  .bind<string>(TYPES.Qualifier)
  .toConstantValue(stringOrThrow(process.env.QUALIFIER, 'Could not find QUALIFIER'));

container.bind<QuoteFormatter>(TYPES.BasicQuoteFormatter).to(BasicQuoteFormatter).inSingletonScope();
container.bind<QuoteFormatter>(TYPES.BlameQuoteFormatter).to(BlameQuoteFormatter).inSingletonScope();

if (useInMemoryQuoteManager()) {
  let quoteManager: InMemoryQuoteManager;
  if (process.env.BUCKET_NAME) {
    quoteManager = new InMemoryQuoteManager(undefined, process.env.BUCKET_NAME);
  } else {
    quoteManager = new InMemoryQuoteManager();
    quoteManager
      .getBucketName(cfnClient)
      .then(() => {
        quoteManager.getQuotesFromS3(QUOTE_MAPPING_PATH).catch((err) => {
          console.error('Failed to get quotes from S3');
          throw err;
        });
      })
      .catch((err) => {
        console.error('Failed to initialize quote manager');
        throw err;
      });
  }
  quoteManager.addExitHook(QUOTE_MAPPING_PATH);
  container.bind<QuoteManager>(TYPES.QuoteManager).toConstantValue(quoteManager);
} else {
  container.bind<DynamoDBClient>(TYPES.DynamoDBClient).toConstantValue(new DynamoDBClient({}));
  const quoteManager = new DdbQuoteManager(container.get(TYPES.DynamoDBClient));
  quoteManager
    .determineTableName(cfnClient)
    .then(() => {
      quoteManager.determineNumberOfQuotes().catch((err) => {
        throw new Error(err);
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
  container.bind<QuoteManager>(TYPES.QuoteManager).toConstantValue(quoteManager);
}

const messageHandlers: MessageHandler[] = [
  new EchoHandler(),
  new AddQuoteHandler(container.get(TYPES.QuoteManager)),
  new GetQuoteHandler(container.get(TYPES.QuoteManager), container.get(TYPES.BasicQuoteFormatter)),
  new BlameQuoteHandler(container.get(TYPES.QuoteManager), container.get(TYPES.BlameQuoteFormatter)),
  new QuoteItHandler(container.get(TYPES.QuoteManager)),
];

container.bind<MessageHandler[]>(TYPES.MessageHandlers).toConstantValue(messageHandlers);

container.bind<CompoundMessageHandler>(TYPES.MessageHandler).to(QuoteBotMessageHandler).inSingletonScope();

let token: string | undefined;
try {
  token = container.get(TYPES.Token);
} catch (err) {
  console.warn('Could not get Token from environment, will try to pull from SSM');
  token = undefined;
}

const bot = new Bot(container.get(TYPES.DiscordClient), container.get(TYPES.MessageHandler), token);

container.bind<Bot>(TYPES.Bot).toConstantValue(bot);

export default container;
