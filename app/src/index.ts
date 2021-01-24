import * as dotenv from 'dotenv';
import container from './inversify.config';
import {TYPES} from './types';
import {Bot} from './bot';

dotenv.config();

const bot = container.get<Bot>(TYPES.Bot);

bot.listen().then(() => {
  console.log('Logged in!')
}).catch((error) => {
  console.log('Oh no! ', error)
});
