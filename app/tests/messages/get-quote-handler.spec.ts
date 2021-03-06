import 'reflect-metadata';
import 'mocha';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { resolvableInstance } from '../utils/resolvableInstance';
import { TestContext } from '../utils/test-context';
import { IndexedQuote, QuoteFormatter, QuoteManager } from '../../src/quotes';
import { GetQuoteHandler } from '../../src/messages/get-quote-handler';

describe('GetQuoteHandler', () => {
  const quoteClass = mock<IndexedQuote>();
  const thirdQuoteClass = mock<IndexedQuote>();
  const wordQuoteClass = mock<IndexedQuote>();

  const quote = resolvableInstance(quoteClass);
  quote.quote.quote = 'yo';
  const thirdQuote = resolvableInstance(thirdQuoteClass);
  thirdQuote.quote.quote = 'hi';
  const wordQuote = resolvableInstance(wordQuoteClass);
  wordQuote.quote.quote = 'word word';
  wordQuote.index = 5;

  let mockedQuoteFormatterClass: QuoteFormatter;
  let mockedQuoteFormatterInstance: QuoteFormatter;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let content: string;

  let testContext: TestContext;

  let getQuoteHandler: GetQuoteHandler;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.get()).thenResolve(quote);
    when(mockedQuoteManagerClass.getByIndex(3)).thenResolve(thirdQuote);
    const quoteList = [wordQuote];
    when(mockedQuoteManagerClass.getBySearch('word')).thenResolve(quoteList);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    mockedQuoteFormatterClass = mock<QuoteFormatter>();
    when(mockedQuoteFormatterClass.formatQuote(anything())).thenCall((arg1: IndexedQuote | IndexedQuote[]) => {
      if (Array.isArray(arg1)) {
        return arg1[0].quote.quote;
      } else {
        return arg1.quote.quote;
      }
    });
    mockedQuoteFormatterInstance = instance(mockedQuoteFormatterClass);

    testContext = new TestContext();

    getQuoteHandler = new GetQuoteHandler(mockedQuoteManagerInstance, mockedQuoteFormatterInstance);
  });

  it('calls get on the quote manager', async () => {
    content = '';
    await getQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(mockedQuoteManagerClass.get()).once();
  });

  it('responds with what it gets from the quote manager', async () => {
    content = '';
    await getQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(quote.quote.quote)).once();
  });

  it('gets the correct quote when passed in a number', async () => {
    content = '3';
    await getQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(thirdQuote.quote.quote)).once();
  });

  it('gets the correct quote when passed in a string', async () => {
    content = 'word';
    await getQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(wordQuote.quote.quote)).once();
  });
});
