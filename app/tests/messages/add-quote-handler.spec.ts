import 'reflect-metadata';
import 'mocha';
import { TestContext } from '../utils/test-context';
import { QuoteManager } from '../../src/quotes/quote-manager';
import { AddQuoteHandler } from '../../src/messages/add-quote-handler';
import { expect } from 'chai';
import { anything, capture, instance, mock, verify } from 'ts-mockito';

describe('AddQuoteHandler', () => {
  let testContext: TestContext;

  let addQuoteHandler: AddQuoteHandler;

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  beforeEach(() => {
    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    testContext = new TestContext();

    testContext.addQuoteMockedMessageInstance.content = testContext.originalMockedMessageInstance.content;

    addQuoteHandler = new AddQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await addQuoteHandler.handle(testContext.addQuoteMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields', async () => {
    await addQuoteHandler.handle(testContext.addQuoteMockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal(testContext.authorUsername);
    expect(quote.blamer).to.be.equal(testContext.blamerUsername);
    expect(quote.quote).to.be.equal(testContext.originalMockedMessageInstance.content);
  });

  it('does not match bad quotes', async () => {
    testContext.addQuoteMockedMessageInstance.content = 'bad';
    await addQuoteHandler.handle(testContext.addQuoteMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).never();
  });
});
