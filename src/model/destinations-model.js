import { MOCK_DESTINATIONS } from '../mock/destinations.js';

export default class DestinationsModel {
  #destinations = MOCK_DESTINATIONS;

  get destinations() {
    return this.#destinations;
  }

  get destinationsById() {
    return new Map(
      this.#destinations.map((destination) => [destination.id, destination])
    );
  }

  get destinationsByName() {
    return new Map(
      this.#destinations.map((destination) => [destination.name, destination])
    );
  }
}
