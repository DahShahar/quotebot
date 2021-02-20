import 'reflect-metadata';
import 'mocha';
import { EchoHandler } from '../../src/messages/echo-handler';
import { instance, mock, verify } from 'ts-mockito';
import { Message } from 'discord.js';

describe('EchoHandler', () => {
  const content = 'echo message';

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let echoHandler: EchoHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = content;

    echoHandler = new EchoHandler();
  });

  it('should respond with with the same message', async () => {
    await echoHandler.handle(content, mockedMessageInstance);

    verify(mockedMessageClass.reply(content)).once();
  });
});
