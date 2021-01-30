import 'reflect-metadata';
import 'mocha'
import {Message} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {TestContext} from '../utils/test-context';
import {GetQuoteHandler} from '../../src/messages/get-quote-handler';
import {instance, mock, verify, when} from 'ts-mockito';

describe('GetQuoteHandler', () => {
  const quote = 'hello world';
  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let testContext: TestContext;

  let getQuoteHandler: GetQuoteHandler;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.get()).thenReturn(quote);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    testContext = new TestContext();

    getQuoteHandler = new GetQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls get on the quote manager', async () => {
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(mockedQuoteManagerClass.get()).once();
    verify(testContext.mockedChannelClass.send(quote)).once();
  });

  it('responds with what it gets from the quote manager', async () => {
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(quote)).once();
  });
});
