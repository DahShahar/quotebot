import 'reflect-metadata';
import 'mocha'
import {Message, User} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {AddQuoteHandler} from '../../src/messages/add-quote-handler';
import {expect} from 'chai';
import {anything, capture, instance, mock, verify, when} from 'ts-mockito';

describe('AddQuoteHandler', () => {
  const username = 'shahar';
  const content = 'test echo';

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let mockedUserClass: User;
  let mockedUser: User;

  let addQuoteHandler: AddQuoteHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);

    mockedUserClass = mock(User);
    mockedUser = instance(mockedUserClass);
    when(mockedMessageClass.author).thenReturn(mockedUser);
    mockedUser.username = username;

    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = content;


    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    addQuoteHandler = new AddQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await addQuoteHandler.handle(mockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields', async () => {
    await addQuoteHandler.handle(mockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal(username);
    expect(quote.blamer).to.be.equal(username);
    expect(quote.quote).to.be.equal(content);
  });
});
