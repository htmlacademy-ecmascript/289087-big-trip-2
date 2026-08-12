import dayjs from 'dayjs';
import he from 'he';
import TripInfoView from '../view/trip-info-view.js';
import { remove, render, RenderPosition, replace } from '../framework/render.js';
import { sortByDate } from '../utils/sort.js';
import { UpdateType } from '../utils/const.js';

const MAX_TITLE_POINTS = 3;
const SHORT_DATE_FORMAT = 'DD MMM';

export default class TripInfoPresenter {
  #container = null;

  #eventsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #component = null;

  constructor({ container, eventsModel, destinationsModel, offersModel }) {
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#eventsModel.addObserver(this.#handleModelAction);
  }

  init() {
    const events = [...this.#eventsModel.events].sort(sortByDate);

    const prevComponent = this.#component;

    if (events.length === 0) {
      remove(prevComponent);
      this.#component = null;
      return;
    }

    this.#component = new TripInfoView({
      title: this.#getTitle(events),
      dates: this.#getDates(events),
      cost: this.#getTotalPrice(events),
    });


    if (prevComponent === null) {
      render(this.#component, this.#container, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#component, prevComponent);
    remove(prevComponent);
  }

  #getTitle(events) {
    const destinationsById = this.#destinationsModel.destinationsById;

    const destinations = events.map(
      ({ destination }) =>
        he.encode(destinationsById.get(destination)?.name ?? '')
    );

    if (destinations.length <= MAX_TITLE_POINTS) {
      return destinations.join('&nbsp;&mdash;&nbsp;');
    }

    return `${destinations[0]}&nbsp;&mdash;&nbsp;...&nbsp;&mdash;&nbsp;${destinations.at(-1)}`;
  }

  #getDates(events) {
    const { dateFrom } = events[0];
    const { dateTo } = events.at(-1);

    const firstDate = dayjs(dateFrom).format(SHORT_DATE_FORMAT);
    const lastDate = dayjs(dateTo).format(SHORT_DATE_FORMAT);

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

  #handleModelAction = (updateType) => {
    if (updateType === UpdateType.PATCH) {
      return;
    }

    this.init();
  };
}
