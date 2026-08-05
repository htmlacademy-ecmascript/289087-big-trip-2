import { MOCK_OFFERS } from '../mock/offers.js';

export default class OffersModel {
  #offers = MOCK_OFFERS;

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
}
