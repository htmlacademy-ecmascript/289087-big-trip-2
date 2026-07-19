import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventsListView from '../view/events-list-view.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import { render, replace } from '../framework/render.js';
import NoEventsView from '../view/no-events-view.js';

export default class TripPresenter {
  #tripContainer = null;
  #eventsModel = null;

  #sortComponent = new SortView();
  #eventsListComponent = new EventsListView();

  #events = [];

  constructor({ tripContainer, eventsModel }) {
    this.#tripContainer = tripContainer;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#events = [...this.#eventsModel.events];

    this.#renderTrip();
  }

  #renderEvent(event) {
    const escKeyDownHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const eventComponent = new EventView({
      event,
      onArrowClick: () => {
        replaceEventToForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const EventEditFormComponent = new EventEditFormView({
      event,
      isNewEvent: false,
      onFormSubmit: () => {
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onArrowClick: () => {
        replaceFormToEvent();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    function replaceFormToEvent() {
      replace(eventComponent, EventEditFormComponent);
    }

    function replaceEventToForm() {
      replace(EventEditFormComponent, eventComponent);
    }

    render(eventComponent, this.#eventsListComponent.element);
  }

  #renderTrip() {
    if (this.#events.length === 0) {
      render(new NoEventsView(), this.#tripContainer);
      return;
    }

    render(this.#sortComponent, this.#tripContainer);
    render(this.#eventsListComponent, this.#tripContainer);

    for (let i = 0; i < this.#events.length; i++) {
      this.#renderEvent(this.#events[i]);
    }
  }
}
