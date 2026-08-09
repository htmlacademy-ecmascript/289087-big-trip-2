import AbstractView from '../framework/view/abstract-view.js';

const createNewEventButtonTemplate = () => '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>';

export default class NewEventButtonView extends AbstractView {
  #handleAddEventClick = null;

  constructor({ onNewEventClick }) {
    super();
    this.#handleAddEventClick = onNewEventClick;
    this.element.addEventListener('click', this.#addEventClickHandler);
  }

  get template() {
    return createNewEventButtonTemplate();
  }

  #addEventClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleAddEventClick();
  };
}
