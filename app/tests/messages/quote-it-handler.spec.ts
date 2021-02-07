import 'reflect-metadata';
import 'mocha';
import { QuoteManager } from '../../src/quotes/quote-manager';
import { QuoteItHandler } from '../../src/messages/quote-it-handler';
import { TestContext } from '../utils/test-context';
import { expect } from 'chai';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

describe('QuoteItHandler', () => {
  let testContext: TestContext;

  let quoteItHandler: QuoteItHandler;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    when(mockedQuoteManagerClass.add(anything())).thenResolve(true);
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    testContext = new TestContext();

    quoteItHandler = new QuoteItHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await quoteItHandler.handle(testContext.quoteItMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields', async () => {
    await quoteItHandler.handle(testContext.quoteItMockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal(testContext.authorUsername);
    expect(quote.blamer).to.be.equal(testContext.blamerUsername);
    expect(quote.quote).to.be.equal(testContext.originalMockedMessageInstance.content);
  });
});
