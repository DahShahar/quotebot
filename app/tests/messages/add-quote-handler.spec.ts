import 'reflect-metadata';
import 'mocha';
import { TestContext } from '../utils/test-context';
import { QuoteManager } from '../../src/quotes/quote-manager';
import { AddQuoteHandler } from '../../src/messages/add-quote-handler';
import { expect } from 'chai';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

describe('AddQuoteHandler', () => {
  let testContext: TestContext;

  let addQuoteHandler: AddQuoteHandler;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let content: string;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.add(anything())).thenResolve(true);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    testContext = new TestContext();

    content = 'shahar dahan "wrote this bot"';
    testContext.addQuoteMockedMessageInstance.content = '!addquote shahar dahan "wrote this bot"';

    addQuoteHandler = new AddQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await addQuoteHandler.handle(content, testContext.addQuoteMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields on a proper message', async () => {
    await addQuoteHandler.handle(content, testContext.addQuoteMockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal('shahar dahan');
    expect(quote.blamer).to.be.equal(testContext.blamerUsername);
    expect(quote.quote).to.be.equal('wrote this bot');
  });

  it('does not add bad quotes', async () => {
    const badQuotes = ['bad', '"hello"', 'author', 'author ""', 'author   ', '   "  "', 'a "b', 'a b"', '"  " test'];
    for (const badQuote of badQuotes) {
      content = badQuote;
      testContext.addQuoteMockedMessageInstance.content = `!addquote badQuote`;
      await addQuoteHandler.handle(content, testContext.addQuoteMockedMessageInstance);

      verify(mockedQuoteManagerClass.add(anything())).never();
    }
  });
});
