import 'reflect-metadata';
import 'mocha'
import {Collection, TextChannel, Message, MessageManager, Snowflake, SnowflakeUtil, User} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {AddQuoteHandler} from '../../src/messages/add-quote-handler';
import {expect} from 'chai';
import {anything, capture, instance, mock, verify, when} from 'ts-mockito';

describe('AddQuoteHandler', () => {
  const firstUsername = 'shahar';
  const secondUsername = 'dahan';
  const content = 'test echo';

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let firstMockedMessageClass: Message;
  let secondMockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let firstMockedMessageInstance: Message;

  let firstMockedUserClass: User;
  let firstMockedUser: User;

  let secondMockedUserClass: User;
  let secondMockedUser: User;

  let mockedChannelClass: TextChannel;
  let mockedChannelInstance: TextChannel;

  let mockedMessageManagerClass: MessageManager;
  let mockedMessageManager: MessageManager;

  let addQuoteHandler: AddQuoteHandler;

  beforeEach(() => {
    firstMockedMessageClass = mock(Message);
    secondMockedMessageClass = mock(Message);

    firstMockedUserClass = mock(User);
    firstMockedUser = instance(firstMockedUserClass);
    when(firstMockedMessageClass.author).thenReturn(firstMockedUser);
    firstMockedUser.username = firstUsername;

    secondMockedUserClass = mock(User);
    secondMockedUser = instance(secondMockedUserClass);
    when(secondMockedMessageClass.author).thenReturn(secondMockedUser);
    secondMockedUser.username = secondUsername;

    mockedChannelClass = mock(TextChannel);

    mockedMessageManagerClass = mock(MessageManager);

    mockedMessageInstance = instance(firstMockedMessageClass);
    mockedMessageInstance.content = content;
    mockedMessageInstance.id = '1';

    firstMockedMessageInstance = instance(secondMockedMessageClass);
    firstMockedMessageInstance.content = 'test echo';
    firstMockedMessageInstance.id = '2';

    const firstSnowflake = SnowflakeUtil.generate(1);
    const secondSnowflake = SnowflakeUtil.generate(2);

    const messageCollection: Collection<Snowflake, Message> = new Collection();
    messageCollection.set(firstSnowflake, mockedMessageInstance);
    messageCollection.set(secondSnowflake, firstMockedMessageInstance);

    when(mockedMessageManagerClass.fetch()).thenResolve(messageCollection);
    mockedMessageManager = instance(mockedMessageManagerClass);
    when(mockedChannelClass.messages).thenReturn(mockedMessageManager);

    mockedChannelInstance = instance(mockedChannelClass);
    when(firstMockedMessageClass.channel).thenReturn(mockedChannelInstance);

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

    expect(quote.author).to.be.equal(secondUsername);
    expect(quote.blamer).to.be.equal(firstUsername);
    expect(quote.quote).to.be.equal(content);
  });
});
