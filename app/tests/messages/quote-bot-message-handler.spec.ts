import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {EchoHandler} from "../../src/messages/echo-handler";
import {CompoundMessageHandler} from "../../src/messages/compound-message-handler";
import {QuoteBotMessageHandler} from "../../src/messages/quote-bot-message-handler";
import {instance, mock, verify, when} from "ts-mockito";
import {Message} from "discord.js";

describe('QuoteBotMessageHandler', () => {
  let mockedEchoHandlerClass: EchoHandler;
  let mockedEchoHandlerInstance: EchoHandler;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let service: QuoteBotMessageHandler;
  let qualifier: string;

  beforeEach(() => {
    mockedEchoHandlerClass = mock(EchoHandler);
    mockedEchoHandlerInstance = instance(mockedEchoHandlerClass);
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    qualifier = '!'
    setMessageContents();

    service = new QuoteBotMessageHandler([mockedEchoHandlerInstance], qualifier);
  })

  it('should reply', async () => {
    whenIsActionableThenReturn(true);

    await service.handleMessage(mockedMessageInstance);

    verify(mockedEchoHandlerClass.handle(mockedMessageInstance)).once();
  })

  it('should not reply', async () => {
    whenIsActionableThenReturn(false);

    await service.handleMessage(mockedMessageInstance).then(() => {
      // Successful promise is unexpected, so we fail the test
      expect.fail('Unexpected promise');
    }).catch(() => {
      // Rejected promise is expected, so nothing happens here
    });

    verify(mockedEchoHandlerClass.handle(mockedMessageInstance)).never();
  })

  function setMessageContents() {
    mockedMessageInstance.content = qualifier + "echo Non-empty string";
  }

  function whenIsActionableThenReturn(result: boolean) {
    when(mockedEchoHandlerClass.identify(mockedMessageInstance)).thenReturn(result);
  }
});
