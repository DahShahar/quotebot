import 'reflect-metadata';
import 'mocha';
import { Quote } from '../../src/quotes/quote';
import { QuoteFormatter } from '../../src/quotes/quote-formatter';
import { QuoteManager } from '../../src/quotes/quote-manager';
import { TestContext } from '../utils/test-context';
import { BlameQuoteHandler } from '../../src/messages/blame-quote-handler';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('GetQuoteHandler', () => {
  const quoteClass = mock<Quote>();

  const quote = instance(quoteClass);
  quote.quote = 'yo';
  quote.blamer = 'me';

  let mockedQuoteFormatterClass: QuoteFormatter;
  let mockedQuoteFormatterInstance: QuoteFormatter;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let testContext: TestContext;

  let blameQuoteHandler: BlameQuoteHandler;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.getByIndex(3)).thenReturn(quote);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    mockedQuoteFormatterClass = mock<QuoteFormatter>();
    when(mockedQuoteFormatterClass.formatQuote(anything())).thenCall((arg1: Quote) => {
      return arg1.blamer;
    });
    mockedQuoteFormatterInstance = instance(mockedQuoteFormatterClass);

    testContext = new TestContext();

    blameQuoteHandler = new BlameQuoteHandler(mockedQuoteManagerInstance, mockedQuoteFormatterInstance);
  });

  it('calls get on the quote manager', async () => {
    testContext.originalMockedMessageInstance.content = '3';
    await blameQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(mockedQuoteManagerClass.getByIndex(3)).once();
  });

  it('formats the correct quote', async () => {
    testContext.originalMockedMessageInstance.content = '3';
    await blameQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(quote.blamer));
  });
});
