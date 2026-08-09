import dayjs from 'dayjs';
import TripInfoView from '../view/trip-info-view.js';
import { remove, render, RenderPosition, replace } from '../framework/render.js';
import { sortByDate } from '../utils/sort.js';

const MAX_TITLE_POINTS = 3;

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
    const events = [...this.#eventsModel.events].sort(sortByDate);

    const prevTripInfoComponent = this.#tripInfoComponent;

    if (events.length === 0) {
      remove(prevTripInfoComponent);
      this.#tripInfoComponent = null;
      return;
    }

    this.#tripInfoComponent = new TripInfoView({
      title: this.#getTitle(events),
      dates: this.#getDates(events),
      cost: this.#getTotalPrice(events),
    });


    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #getTitle(events) {
    const destinationsById = this.#destinationsModel.destinationsById;

    const destinations = events.map(
      ({ destination }) =>
        destinationsById.get(destination)?.name ?? ''
    );

    if (destinations.length <= MAX_TITLE_POINTS) {
      return destinations.join('&nbsp;&mdash;&nbsp;');
    }

    return `${destinations[0]}&nbsp;&mdash;&nbsp;...&nbsp;&mdash;&nbsp;${destinations.at(-1)}`;
  }

  #getDates(events) {
    const { dateFrom } = events[0];
    const { dateTo } = events.at(-1);

    const firstDate = dayjs(dateFrom).format('DD MMM');
    const lastDate = dayjs(dateTo).format('DD MMM');

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
