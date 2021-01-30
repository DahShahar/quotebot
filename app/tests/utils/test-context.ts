import {Collection, TextChannel, Message, MessageManager, MessageReference, Snowflake, SnowflakeUtil, User} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {resolvableInstance} from '../utils/resolvableInstance';
import {anything, capture, deepEqual, instance, mock, verify, when} from 'ts-mockito';

export class TestContext {
    public authorUsername = 'shahar';
    public blamerUsername = 'dahan';

    public originalMockedMessageClass: Message;
    public originalMockedMessageInstance: Message;

    public addQuoteMockedMessageClass: Message;
    public addQuoteMockedMessageInstance: Message;

    public quoteItMockedMessageClass: Message;
    public quoteItMockedMessageInstance: Message;

    public authorMockedUserClass: User;
    public authorMockedUser: User;

    public blamerMockedUserClass: User;
    public blamerMockedUser: User;

    public mockedChannelClass: TextChannel;
    public mockedChannelInstance: TextChannel;

    public mockedMessageReferenceClass: MessageReference;
    public mockedMessageReference: MessageReference;

    public mockedMessageManagerClass: MessageManager;
    public mockedMessageManager: MessageManager;

  constructor() {
    this.originalMockedMessageClass = mock(Message);
    this.addQuoteMockedMessageClass = mock(Message);
    this.quoteItMockedMessageClass = mock(Message);

    this.authorMockedUserClass = mock(User);
    this.authorMockedUser = instance(this.authorMockedUserClass);
    when(this.originalMockedMessageClass.author).thenReturn(this.authorMockedUser);
    this.authorMockedUser.username = this.authorUsername;

    this.blamerMockedUserClass = mock(User);
    this.blamerMockedUser = instance(this.blamerMockedUserClass);
    when(this.addQuoteMockedMessageClass.author).thenReturn(this.blamerMockedUser);
    when(this.quoteItMockedMessageClass.author).thenReturn(this.blamerMockedUser);
    this.blamerMockedUser.username = this.blamerUsername;

    this.mockedChannelClass = mock(TextChannel);

    this.mockedMessageManagerClass = mock(MessageManager);

    this.originalMockedMessageInstance = resolvableInstance(this.originalMockedMessageClass);
    this.originalMockedMessageInstance.content = 'this is the o.g. quote';

    const firstSnowflake = SnowflakeUtil.generate(1);
    this.originalMockedMessageInstance.id = firstSnowflake;

    const secondSnowflake = SnowflakeUtil.generate(2);
    const thirdSnowflake = SnowflakeUtil.generate(3);

    const messageCollection: Collection<Snowflake, Message> = new Collection();
    messageCollection.set(firstSnowflake, this.originalMockedMessageInstance);

    when(this.mockedMessageManagerClass.fetch()).thenResolve(messageCollection);
    when(this.mockedMessageManagerClass.fetch(deepEqual(firstSnowflake))).thenResolve(this.originalMockedMessageInstance);
    this.mockedMessageManager = instance(this.mockedMessageManagerClass);
    when(this.mockedChannelClass.messages).thenReturn(this.mockedMessageManager);

    this.mockedChannelInstance = instance(this.mockedChannelClass);
    when(this.addQuoteMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
    when(this.quoteItMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
    when(this.originalMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
    this.addQuoteMockedMessageInstance = instance(this.addQuoteMockedMessageClass);
    this.addQuoteMockedMessageInstance.content = 'this was called with addquote';
    this.addQuoteMockedMessageInstance.id = secondSnowflake;
    messageCollection.set(secondSnowflake, this.addQuoteMockedMessageInstance);

    this.mockedMessageReferenceClass = mock<MessageReference>();
    when(this.mockedMessageReferenceClass.messageID).thenReturn(this.originalMockedMessageInstance.id);
    this.mockedMessageReference = instance(this.mockedMessageReferenceClass);
    when(this.quoteItMockedMessageClass.reference).thenReturn(this.mockedMessageReference);
    this.quoteItMockedMessageInstance = instance(this.quoteItMockedMessageClass);
    this.quoteItMockedMessageInstance.content = 'this was called with quoteit';
    this.quoteItMockedMessageInstance.id = thirdSnowflake;
    messageCollection.set(thirdSnowflake, this.quoteItMockedMessageInstance);
  }

}
