import 'reflect-metadata';
import 'mocha';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { TestContext } from '../utils/test-context';
import { resolvableInstance } from '../utils/resolvableInstance';
import { IndexedQuote, Quote, QuoteFormatter, QuoteManager } from '../../src/quotes';
import { BlameQuoteHandler } from '../../src/messages/blame-quote-handler';

describe('BlameQuoteHandler', () => {
  const quoteClass = mock<Quote>();

  const embeddedQuote = resolvableInstance(quoteClass);
  embeddedQuote.quote = 'yo';
  embeddedQuote.blamer = 'me';

  const indexedQuoteClass = mock<IndexedQuote>();
  const indexedQuote = resolvableInstance(indexedQuoteClass);
  indexedQuote.quote = embeddedQuote;
  indexedQuote.index = 1;

  let mockedQuoteFormatterClass: QuoteFormatter;
  let mockedQuoteFormatterInstance: QuoteFormatter;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let content: string;

  let testContext: TestContext;

  let blameQuoteHandler: BlameQuoteHandler;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.getByIndex(3)).thenResolve(indexedQuote);
    mockedQuoteManagerInstance = resolvableInstance(mockedQuoteManagerClass);

    mockedQuoteFormatterClass = mock<QuoteFormatter>();
    when(mockedQuoteFormatterClass.formatQuote(anything())).thenCall((arg1: IndexedQuote) => {
      return arg1.quote.blamer;
    });
    mockedQuoteFormatterInstance = instance(mockedQuoteFormatterClass);

    testContext = new TestContext();

    blameQuoteHandler = new BlameQuoteHandler(mockedQuoteManagerInstance, mockedQuoteFormatterInstance);
  });

  it('calls get on the quote manager', async () => {
    testContext.originalMockedMessageInstance.content = '!blamequote 3';
    content = '3';
    await blameQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(mockedQuoteManagerClass.getByIndex(parseInt(content))).once();
  });

  it('formats the correct quote', async () => {
    testContext.originalMockedMessageInstance.content = '!blamequote 3';
    content = '3';
    await blameQuoteHandler.handle(content, testContext.originalMockedMessageInstance);

    verify(testContext.mockedChannelClass.send(embeddedQuote.blamer));
  });
});
