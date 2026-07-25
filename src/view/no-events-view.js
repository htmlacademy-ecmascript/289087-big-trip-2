import AbstractView from '../framework/view/abstract-view.js';
import { TripMessages } from '../utils/const.js';

const createNoEventsTemplate = () => `<p class="trip-events__msg">${TripMessages.NO_EVENTS}</p>`;

export default class NoEventsView extends AbstractView {
  get template() {
    return createNoEventsTemplate();
  }
}
