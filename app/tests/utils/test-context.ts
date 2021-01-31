import {
  Collection,
  TextChannel,
  Message,
  MessageManager,
  MessageReaction,
  MessageReference,
  Snowflake,
  SnowflakeUtil,
  User,
} from 'discord.js';
import { resolvableInstance } from '../utils/resolvableInstance';
import { anything, deepEqual, instance, mock, when } from 'ts-mockito';

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

  public messageCollection: Collection<Snowflake, Message>;

  constructor() {
    this.setUpMessageMocks();

    this.setUpMessageInstances();

    this.setUpUserMocks();

    this.setUpChannelMock();

    this.setUpMessageManagerMock();
  }

  private setUpMessageMocks() {
    this.originalMockedMessageClass = mock(Message);
    this.addQuoteMockedMessageClass = mock(Message);
    this.quoteItMockedMessageClass = mock(Message);
  }

  private setUpMessageInstances() {
    const firstSnowflake = SnowflakeUtil.generate(1);
    const secondSnowflake = SnowflakeUtil.generate(2);
    const thirdSnowflake = SnowflakeUtil.generate(3);
    this.messageCollection = new Collection();

    this.originalMockedMessageInstance = resolvableInstance(this.originalMockedMessageClass);
    this.originalMockedMessageInstance.content = 'this is the o.g. quote';
    this.originalMockedMessageInstance.id = firstSnowflake;
    this.messageCollection.set(firstSnowflake, this.originalMockedMessageInstance);

    when(this.addQuoteMockedMessageClass.react(anything())).thenResolve(instance(mock(MessageReaction)));
    this.addQuoteMockedMessageInstance = instance(this.addQuoteMockedMessageClass);
    this.addQuoteMockedMessageInstance.content = 'this was called with addquote';
    this.addQuoteMockedMessageInstance.id = secondSnowflake;
    this.messageCollection.set(secondSnowflake, this.addQuoteMockedMessageInstance);

    this.quoteItMockedMessageInstance = instance(this.quoteItMockedMessageClass);
    this.quoteItMockedMessageInstance.content = 'this was called with quoteit';
    this.quoteItMockedMessageInstance.id = thirdSnowflake;
    this.messageCollection.set(thirdSnowflake, this.quoteItMockedMessageInstance);

    this.mockedMessageReferenceClass = mock<MessageReference>();
    when(this.mockedMessageReferenceClass.messageID).thenReturn(this.originalMockedMessageInstance.id);
    this.mockedMessageReference = instance(this.mockedMessageReferenceClass);
    when(this.quoteItMockedMessageClass.reference).thenReturn(this.mockedMessageReference);
  }

  private setUpUserMocks() {
    this.authorMockedUserClass = mock(User);
    this.authorMockedUser = instance(this.authorMockedUserClass);
    when(this.originalMockedMessageClass.author).thenReturn(this.authorMockedUser);
    this.authorMockedUser.username = this.authorUsername;

    this.blamerMockedUserClass = mock(User);
    this.blamerMockedUser = instance(this.blamerMockedUserClass);
    when(this.addQuoteMockedMessageClass.author).thenReturn(this.blamerMockedUser);
    when(this.quoteItMockedMessageClass.author).thenReturn(this.blamerMockedUser);
    this.blamerMockedUser.username = this.blamerUsername;
  }

  private setUpChannelMock() {
    this.mockedChannelClass = mock(TextChannel);

    this.mockedChannelInstance = instance(this.mockedChannelClass);
    when(this.addQuoteMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
    when(this.quoteItMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
    when(this.originalMockedMessageClass.channel).thenReturn(this.mockedChannelInstance);
  }

  private setUpMessageManagerMock() {
    this.mockedMessageManagerClass = mock(MessageManager);
    when(this.mockedMessageManagerClass.fetch()).thenResolve(this.messageCollection);
    when(this.mockedMessageManagerClass.fetch(deepEqual(this.originalMockedMessageInstance.id))).thenResolve(
      this.originalMockedMessageInstance
    );

    this.mockedMessageManager = instance(this.mockedMessageManagerClass);
    when(this.mockedChannelClass.messages).thenReturn(this.mockedMessageManager);
  }
}
