import { EVENT_TYPES } from '../const.js';
import { getRandomInteger, shuffle } from '../utils.js';

const offersTitles = [
  'Add luggage',
  'Switch to comfort',
  'Add meal',
  'Choose seats',
  'Travel by train',
  'Book tickets',
  'Lunch in city',
  'Add breakfast',
  'Order Uber',
];

const createOffers = () =>
  EVENT_TYPES.map((type) => {
    const offersCount = getRandomInteger(0, 5);
    const titles = shuffle(offersTitles).slice(0, offersCount);

    return {
      type,
      offers: titles.map((title, index) => ({
        id: `${type.toLowerCase()}-${index}`,
        title,
        price: getRandomInteger(1, 150),
      })),
    };
  });

export const MOCK_OFFERS = createOffers();
