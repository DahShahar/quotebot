import 'reflect-metadata';
import 'mocha'
import {Collection, TextChannel, Message, MessageManager, Snowflake, SnowflakeUtil, User} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {AddQuoteHandler} from '../../src/messages/add-quote-handler';
import {expect} from 'chai';
import {anything, capture, instance, mock, verify, when} from 'ts-mockito';

describe('AddQuoteHandler', () => {
  const authorUsername = 'shahar';
  const blamerUsername = 'dahan';
  const content = 'test echo';

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let originalMockedMessageClass: Message;
  let originalMockedMessageInstance: Message;

  let addQuoteMockedMessageClass: Message;
  let addQuoteMockedMessageInstance: Message;

  let authorMockedUserClass: User;
  let authorMockedUser: User;

  let blamerMockedUserClass: User;
  let blamerMockedUser: User;

  let mockedChannelClass: TextChannel;
  let mockedChannelInstance: TextChannel;

  let mockedMessageManagerClass: MessageManager;
  let mockedMessageManager: MessageManager;

  let addQuoteHandler: AddQuoteHandler;

  beforeEach(() => {
    originalMockedMessageClass = mock(Message);
    addQuoteMockedMessageClass = mock(Message);

    authorMockedUserClass = mock(User);
    authorMockedUser = instance(authorMockedUserClass);
    when(originalMockedMessageClass.author).thenReturn(authorMockedUser);
    authorMockedUser.username = authorUsername;

    blamerMockedUserClass = mock(User);
    blamerMockedUser = instance(blamerMockedUserClass);
    when(addQuoteMockedMessageClass.author).thenReturn(blamerMockedUser);
    blamerMockedUser.username = blamerUsername;

    mockedChannelClass = mock(TextChannel);

    mockedMessageManagerClass = mock(MessageManager);

    originalMockedMessageInstance = instance(originalMockedMessageClass);
    originalMockedMessageInstance.content = content;
    originalMockedMessageInstance.id = '1';

    const firstSnowflake = SnowflakeUtil.generate(1);
    const secondSnowflake = SnowflakeUtil.generate(2);

    const messageCollection: Collection<Snowflake, Message> = new Collection();
    messageCollection.set(firstSnowflake, originalMockedMessageInstance);
    messageCollection.set(secondSnowflake, addQuoteMockedMessageInstance);

    when(mockedMessageManagerClass.fetch()).thenResolve(messageCollection);
    mockedMessageManager = instance(mockedMessageManagerClass);
    when(mockedChannelClass.messages).thenReturn(mockedMessageManager);

    mockedChannelInstance = instance(mockedChannelClass);
    when(addQuoteMockedMessageClass.channel).thenReturn(mockedChannelInstance);
    addQuoteMockedMessageInstance = instance(addQuoteMockedMessageClass);
    addQuoteMockedMessageInstance.content = 'test echo';
    addQuoteMockedMessageInstance.id = '2';

    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    addQuoteHandler = new AddQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await addQuoteHandler.handle(addQuoteMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields', async () => {
    await addQuoteHandler.handle(addQuoteMockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal(authorUsername);
    expect(quote.blamer).to.be.equal(blamerUsername);
    expect(quote.quote).to.be.equal(content);
  });

  it('does not match bad quotes', async () => {
    addQuoteMockedMessageInstance.content = 'bad';
    await addQuoteHandler.handle(addQuoteMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).never();
  });
});
