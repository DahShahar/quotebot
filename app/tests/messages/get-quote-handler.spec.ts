import 'reflect-metadata';
import 'mocha';
import { Quote } from '../../src/quotes/quote';
import { QuoteFormatter } from '../../src/quotes/quote-formatter';
import { QuoteManager } from '../../src/quotes/quote-manager';
import { TestContext } from '../utils/test-context';
import { GetQuoteHandler } from '../../src/messages/get-quote-handler';
import { resolvableInstance } from '../utils/resolvableInstance';
import { anything, instance, mock, verify, when } from 'ts-mockito';

describe('GetQuoteHandler', () => {
  const quoteClass = mock<Quote>();
  const thirdQuoteClass = mock<Quote>();
  const wordQuoteClass = mock<Quote>();

  const quote = resolvableInstance(quoteClass);
  quote.quote = 'yo';
  const thirdQuote = resolvableInstance(thirdQuoteClass);
  thirdQuote.quote = 'hi';
  const wordQuote = resolvableInstance(wordQuoteClass);
  wordQuote.quote = 'word word';

  let mockedQuoteFormatterClass: QuoteFormatter;
  let mockedQuoteFormatterInstance: QuoteFormatter;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let testContext: TestContext;

  let getQuoteHandler: GetQuoteHandler;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.get()).thenResolve(quote);
    when(mockedQuoteManagerClass.getByIndex(3)).thenResolve(thirdQuote);
    const quoteMap = new Map<number, Quote>();
    quoteMap.set(5, wordQuote);
    when(mockedQuoteManagerClass.getBySearch('word')).thenReturn(quoteMap);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    mockedQuoteFormatterClass = mock<QuoteFormatter>();
    when(mockedQuoteFormatterClass.formatQuote(anything())).thenCall((arg1: Quote) => {
      return arg1.quote;
    });
    mockedQuoteFormatterInstance = instance(mockedQuoteFormatterClass);

    testContext = new TestContext();

    getQuoteHandler = new GetQuoteHandler(mockedQuoteManagerInstance, mockedQuoteFormatterInstance);
  });

  it('calls get on the quote manager', async () => {
    testContext.originalMockedMessageInstance.content = '';
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(mockedQuoteManagerClass.get()).once();
  });

  it('responds with what it gets from the quote manager', async () => {
    testContext.originalMockedMessageInstance.content = '';
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(quote.quote)).once();
  });

  it('gets the correct quote when passed in a number', async () => {
    testContext.originalMockedMessageInstance.content = '3';
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(thirdQuote.quote)).once();
  });

  it('gets the correct quote when passed in a string', async () => {
    testContext.originalMockedMessageInstance.content = 'word';
    await getQuoteHandler.handle(testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(wordQuote.quote)).once();
  });
});
