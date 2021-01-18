import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {MessageHandler} from "./messages/message-handler";
import {EchoHandler} from "./messages/echo-handler";
import {CompoundMessageHandler} from "./messages/compound-message-handler";
import {QuoteBoteMessageHandler} from "./messages/quote-bot-message-handler";
import {Client} from "discord.js";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<string>(TYPES.Qualifier).toConstantValue(process.env.QUALIFIER);

const messageHandlers: MessageHandler[] = [
  new EchoHandler(),
];

container.bind<MessageHandler[]>(TYPES.MessageHandlers).toConstantValue(messageHandlers);

container.bind<CompoundMessageHandler>(TYPES.MessageHandler).to(QuoteBoteMessageHandler).inSingletonScope();

export default container;
