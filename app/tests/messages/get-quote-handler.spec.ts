import 'reflect-metadata';
import 'mocha'
import {Message} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {GetQuoteHandler} from '../../src/messages/get-quote-handler';
import {instance, mock, verify} from 'ts-mockito';

describe('GetQuoteHandler', () => {
  const content = "test echo";

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let getQuoteHandler: GetQuoteHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = content;

    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    getQuoteHandler = new GetQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls get on the quote manager ', async () => {
    await getQuoteHandler.handle(mockedMessageInstance);

    verify(mockedQuoteManagerClass.get()).once();
  });
});
