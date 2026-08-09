export default class OffersModel {
  #offersApiService = null;
  #offers = [];

  constructor({ offersApiService }) {
    this.#offersApiService = offersApiService;
  }

  get offers() {
    return this.#offers;
  }

  get offersByEventType() {
    return new Map(
      this.#offers.map((item) => [item.type, item.offers])
    );
  }

  get offersById() {
    return new Map(
      this.#offers
        .flatMap(({ offers }) => offers)
        .map((offer) => [offer.id, offer])
    );
  }

  async init() {
    this.#offers = await this.#offersApiService.offers;
  }
}
