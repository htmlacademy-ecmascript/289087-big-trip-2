import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../utils/const.js';

const NoEventMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now'
};

const createNoEventTemplate = (filterType) => {
  const text = NoEventMessage[filterType];

  return `<p class="trip-events__msg">${text}</p>`;
};

export default class NoEventView extends AbstractView {
  #filterType = null;

  constructor({ filterType }) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoEventTemplate(this.#filterType);
  }
}
