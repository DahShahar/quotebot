import 'reflect-metadata';
import 'mocha'
import {Message} from 'discord.js';
import {QuoteManager} from '../../src/quotes/quote-manager';
import {AddQuoteHandler} from '../../src/messages/add-quote-handler';
import {instance, mock, verify} from 'ts-mockito';

describe('AddQuoteHandler', () => {
  const content = "test echo";

  let mockedQuoteManagerClass: QuoteManager;
  let mockedQuoteManagerInstance: QuoteManager;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let addQuoteHandler: AddQuoteHandler;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedMessageInstance.content = content;

    mockedQuoteManagerClass = mock<QuoteManager>();
    mockedQuoteManagerInstance = instance(mockedQuoteManagerClass);

    addQuoteHandler = new AddQuoteHandler(mockedQuoteManagerInstance);
  });

  it('calls add on the quote manager with the right content', async () => {
    await addQuoteHandler.handle(mockedMessageInstance);

    verify(mockedQuoteManagerClass.add(content)).once();
  });
});
