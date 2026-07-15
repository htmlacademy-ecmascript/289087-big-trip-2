import { DESTINATIONS } from '../const.js';
import { getRandomArrayElement, getRandomInteger } from '../utils.js';

const descriptionFragments = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
  'Cras aliquet varius magna, non porta ligula feugiat eget. ',
  'Fusce tristique felis at fermentum pharetra. ',
  'Aliquam id orci ut lectus varius viverra. ',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante. ',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum. ',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. ',
  'Sed sed nisi sed augue convallis suscipit in sed felis. ',
  'Aliquam erat volutpat. ',
  'Nunc fermentum tortor ac porta dapibus. ',
  'In rutrum ac purus sit amet tempus. '
];

const createDestinationDescription = () =>
  Array.from(
    { length: getRandomInteger(0, 5) },
    () => getRandomArrayElement(descriptionFragments)
  ).join('');

const createDestinationPhotos = (place) =>
  Array.from(
    { length: getRandomInteger(0, 5) },
    () => ({
      src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 15)}.jpg`,
      description: `${place} photo`,
    }));

const generateMockDestinations = () =>
  DESTINATIONS.map((name) => ({
    id: `${name.toUpperCase()}`,
    name,
    description: createDestinationDescription(),
    pictures: createDestinationPhotos(name),
  }));

export const MOCK_DESTINATIONS = generateMockDestinations();
