import 'reflect-metadata';
import 'mocha'
import {Collection, TextChannel, Message, MessageManager, MessageReference, Snowflake, SnowflakeUtil, User} from 'discord.js';
import {resolvableInstance} from '../utils/resolvableInstance';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {QuoteItHandler} from '../../src/messages/quote-it-handler';
import {expect} from 'chai';
import {anything, capture, deepEqual, instance, mock, match, verify, when} from 'ts-mockito';

describe('QuoteItHandler', () => {
  const authorUsername = 'shahar';
  const blamerUsername = 'dahan';
  const content = 'test echo';

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let originalMockedMessageClass: Message;
  let originalMockedMessageInstance: Message;

  let quoteItMockedMessageClass: Message;
  let quoteItMockedMessageInstance: Message;

  let authorMockedUserClass: User;
  let authorMockedUser: User;

  let blamerMockedUserClass: User;
  let blamerMockedUser: User;

  let mockedChannelClass: TextChannel;
  let mockedChannelInstance: TextChannel;

  let mockedMessageManagerClass: MessageManager;
  let mockedMessageManager: MessageManager;

  let mockedMessageReferenceClass: MessageReference;
  let mockedMessageReference: MessageReference;

  let quoteItHandler: QuoteItHandler;

  beforeEach(() => {
    originalMockedMessageClass = mock(Message);
    quoteItMockedMessageClass = mock(Message);

    const firstSnowflake = SnowflakeUtil.generate(1);
    const secondSnowflake = SnowflakeUtil.generate(2);

    const messageCollection: Collection<Snowflake, Message> = new Collection();
    messageCollection.set(firstSnowflake, originalMockedMessageInstance);
    messageCollection.set(secondSnowflake, quoteItMockedMessageInstance);

    authorMockedUserClass = mock(User);
    authorMockedUser = instance(authorMockedUserClass);
    when(originalMockedMessageClass.author).thenReturn(authorMockedUser);
    authorMockedUser.username = authorUsername;

    blamerMockedUserClass = mock(User);
    blamerMockedUser = instance(blamerMockedUserClass);
    when(quoteItMockedMessageClass.author).thenReturn(blamerMockedUser);
    blamerMockedUser.username = blamerUsername;

    mockedChannelClass = mock(TextChannel);

    mockedMessageManagerClass = mock(MessageManager);

    originalMockedMessageInstance = resolvableInstance(originalMockedMessageClass);
    originalMockedMessageInstance.content = content;
    originalMockedMessageInstance.id = firstSnowflake;

    when(mockedMessageManagerClass.fetch(deepEqual(firstSnowflake))).thenResolve(originalMockedMessageInstance);
    mockedMessageManager = instance(mockedMessageManagerClass);
    when(mockedChannelClass.messages).thenReturn(mockedMessageManager);

    mockedChannelInstance = instance(mockedChannelClass);
    when(quoteItMockedMessageClass.channel).thenReturn(mockedChannelInstance);

    mockedMessageReferenceClass = mock<MessageReference>();
    when(mockedMessageReferenceClass.messageID).thenReturn(originalMockedMessageInstance.id);
    mockedMessageReference = instance(mockedMessageReferenceClass);

    when(quoteItMockedMessageClass.reference).thenReturn(mockedMessageReference);
    quoteItMockedMessageInstance = instance(quoteItMockedMessageClass);
    quoteItMockedMessageInstance.content = 'test echo';
    quoteItMockedMessageInstance.id = secondSnowflake;

    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    quoteItHandler = new QuoteItHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager', async () => {
    await quoteItHandler.handle(quoteItMockedMessageInstance);

    verify(mockedQuoteManagerClass.add(anything())).once();
  });

  it('constructs a quote with expected fields', async () => {
    await quoteItHandler.handle(quoteItMockedMessageInstance);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [quote] = capture(mockedQuoteManagerClass.add).first();

    expect(quote.author).to.be.equal(authorUsername);
    expect(quote.blamer).to.be.equal(blamerUsername);
    expect(quote.quote).to.be.equal(content);
  });
});

