import dayjs from 'dayjs';
import TripInfoView from '../view/trip-info-view.js';
import { remove, render, RenderPosition, replace } from '../framework/render.js';

export default class TripInfoPresenter {
  #container = null;
  #eventsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #tripInfoComponent = null;

  constructor({ container, eventsModel, destinationsModel, offersModel }) {
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#eventsModel.addObserver(this.#handleModelAction);
  }

  init() {
    const events = this.#eventsModel.events;

    const prevTripInfoComponent = this.#tripInfoComponent;

    if (events.length === 0) {
      remove(prevTripInfoComponent);
      this.#tripInfoComponent = null;
      return;
    }

    this.#tripInfoComponent = new TripInfoView({
      route: this.#getRoute(events),
      dates: this.#getDates(events),
      totalPrice: this.#getTotalPrice(events),
    });


    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #getRoute(events) {
    const destinationsById = this.#destinationsModel.destinationsById;

    const destinations = events.map(
      ({ destination }) =>
        destinationsById.get(destination).name
    );

    if (destinations.length <= 3) {
      return destinations.join(' — ');
    }

    return `${destinations[0]} — ... — ${destinations.at(-1)}`;
  }

  #getDates(events) {
    const start = events[0].dateFrom;
    const finish = events.at(-1).dateTo;

    const firstDate = dayjs(start).format('MMM DD');
    const lastDate = dayjs(finish).format('MMM DD');

    return `${firstDate}&nbsp;&mdash;&nbsp;${lastDate}`;
  }

  #getTotalPrice(events) {
    const offersById = this.#offersModel.offersById;
    return events.reduce((total, event) => {
      const offersPrice = event.offers.reduce((sum, offerId) => {
        const offer = offersById.get(offerId);

        return sum + (offer?.price ?? 0);
      }, 0);

      return total + event.price + offersPrice;
    }, 0);
  }

  #handleModelAction = () => {
    this.init();
  };
}
