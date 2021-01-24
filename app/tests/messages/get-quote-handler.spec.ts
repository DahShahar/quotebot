import 'reflect-metadata';
import 'mocha'
import {Message} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {GetQuoteHandler} from '../../src/messages/get-quote-handler';
import {instance, mock, verify, when} from 'ts-mockito';

describe('GetQuoteHandler', () => {
  const quote = 'hello world';
  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let getQuoteHandler: GetQuoteHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);

    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);
    when(mockedQuoteManagerClass.get()).thenReturn(quote);

    getQuoteHandler = new GetQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls get on the quote manager', async () => {
    await getQuoteHandler.handle(mockedMessageInstance);

    verify(mockedQuoteManagerClass.get()).once();
    verify(mockedMessageClass.reply(quote)).once();
  });

  it('responds with what it gets from the quote manager', async () => {
    await getQuoteHandler.handle(mockedMessageInstance);

    verify(mockedMessageClass.reply(quote)).once();
  });
});
