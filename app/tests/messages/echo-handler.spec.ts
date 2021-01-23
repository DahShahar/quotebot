import 'reflect-metadata';
import 'mocha';
import {expect} from 'chai';
import {EchoHandler} from '../../src/messages/echo-handler';
import {instance, mock, verify, when} from 'ts-mockito';
import {Message} from 'discord.js';

describe('EchoHandler', () => {
  let content: string = "echo message";

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let echoHandler: EchoHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = content;

    echoHandler = new EchoHandler();
  });

  it('should respond when the message starts with echo', () => {
    expect(echoHandler.identify(mockedMessageInstance)).to.be.true;
  });

  it('should not respond when the message does not start with echo', () => {
    mockedMessageInstance.content = 'bad message';
    expect(echoHandler.identify(mockedMessageInstance)).to.be.false;
  });

  it('should respond with with the same message', async () => {
    await echoHandler.handle(mockedMessageInstance);

    verify(mockedMessageClass.reply(content)).once();
  });
});
