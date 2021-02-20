import 'reflect-metadata';
import 'mocha';
import { expect } from 'chai';
import { EchoHandler } from '../../src/messages/echo-handler';
import { QuoteBotMessageHandler } from '../../src/messages/quote-bot-message-handler';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { Message, User } from 'discord.js';

describe('QuoteBotMessageHandler', () => {
  let mockedEchoHandlerClass: EchoHandler;
  let mockedEchoHandlerInstance: EchoHandler;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedUserClass: User;
  let mockedUser: User;

  let service: QuoteBotMessageHandler;
  let qualifier: string;

  beforeEach(() => {
    mockedEchoHandlerClass = mock(EchoHandler);
    when(mockedEchoHandlerClass.getIdentifier()).thenReturn('echo');
    mockedEchoHandlerInstance = instance(mockedEchoHandlerClass);

    mockedMessageClass = mock(Message);
    mockedUserClass = mock(User);
    mockedUser = instance(mockedUserClass);
    when(mockedMessageClass.author).thenReturn(mockedUser);

    mockedMessageInstance = instance(mockedMessageClass);
    qualifier = '!';
    setMessageContents();

    service = new QuoteBotMessageHandler([mockedEchoHandlerInstance], qualifier);
  });

  it('should handle this message', () => {
    expect(service.shouldIgnoreMessage(mockedMessageInstance)).to.be.false;
  });

  it('should not handle this message', () => {
    mockedMessageInstance.content = 'THIS IS BAD';

    expect(service.shouldIgnoreMessage(mockedMessageInstance)).to.be.true;
  });

  it('should not handle bot messages', () => {
    mockedUser.bot = true;
    expect(service.shouldIgnoreMessage(mockedMessageInstance)).to.be.true;
  });

  it('should pass it to the handler', async () => {
    await service.handleMessage(mockedMessageInstance);

    verify(mockedEchoHandlerClass.handle(anything(), mockedMessageInstance)).once();
  });

  it('should not pass it on', async () => {
    mockedMessageInstance.content = '!notecho a good string';

    await service
      .handleMessage(mockedMessageInstance)
      .then(() => {
        // Successful promise is unexpected, so we fail the test
        expect.fail('Unexpected promise');
      })
      .catch(() => {
        // Rejected promise is expected, so nothing happens here
      });

    verify(mockedEchoHandlerClass.handle(anything(), mockedMessageInstance)).never();
  });

  it('should pass only the correct content onwards', async () => {
    mockedMessageInstance.content = `${qualifier}echo ${qualifier}`;

    await service.handleMessage(mockedMessageInstance);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const [content, message] = capture(mockedEchoHandlerClass.handle).first();

    expect(content).to.be.equal(qualifier);
    expect(message.content).to.be.equal(mockedMessageInstance.content);
  });

  function setMessageContents() {
    mockedUser.bot = false;
    mockedMessageInstance.content = qualifier + 'echo Non-empty string';
  }
});
