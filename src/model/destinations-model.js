export default class DestinationsModel {
  #destinationsApiService = null;
  #destinations = [];

  constructor({ destinationsApiService }) {
    this.#destinationsApiService = destinationsApiService;
  }

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

  async init() {
    this.#destinations = await this.#destinationsApiService.destinations;
  }
}
