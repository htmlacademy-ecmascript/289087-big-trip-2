import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import { remove, render } from '../framework/render.js';
import NoEventsView from '../view/no-events-view.js';
import EventPresenter from './event-presenter.js';
import { updateItem } from '../utils/event.js';
import { SortType } from '../utils/const.js';
import { compareByDate, compareByPrice, compareByTime } from '../utils/sort.js';

export default class TripBoardPresenter {
  #tripContainer = null;
  #eventsModel = null;

  #sortComponent = null;
  #eventsListComponent = new EventsListView();
  #noEventsComponent = new NoEventsView();

  #events = [];
  #eventsPresenters = new Map();
  #currentSortType = SortType.DEFAULT;
  #sourcedBoardEvents = [];

  constructor({ tripContainer, eventsModel }) {
    this.#tripContainer = tripContainer;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#events = [...this.#eventsModel.events];
    this.#sourcedBoardEvents = [...this.#eventsModel.events];

    this.#sortEvents();
    this.#renderTripBoard();
  }

  #sortEvents(sortType) {
    switch (sortType) {
      case SortType.TIME:
        this.#events.sort(compareByTime);
        break;
      case SortType.PRICE:
        this.#events.sort(compareByPrice);
        break;
      case SortType.DEFAULT:
      default:
        this.#events.sort(compareByDate);
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#sortEvents(sortType);

    this.#clearTripBoard();
    this.#renderTripBoard();
  };

  #handleModeChange = () => {
    this.#eventsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleEventChange = (updatedEvent) => {
    this.#events = updateItem(this.#events, updatedEvent);
    this.#sourcedBoardEvents = updateItem(this.#sourcedBoardEvents, updatedEvent);
    this.#eventsPresenters.get(updatedEvent.id).init(updatedEvent);
  };

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      eventsListContainer: this.#eventsListComponent.element,
      onDataChange: this.#handleEventChange,
      onModeChange: this.#handleModeChange
    });
    eventPresenter.init(event);
    this.#eventsPresenters.set(event.id, eventPresenter);
  }

  #renderTripBoard() {
    if (this.#events.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderEventsList();
    this.#renderEvents();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#tripContainer);
  }

  #renderEventsList() {
    render(this.#eventsListComponent, this.#tripContainer);
  }

  #renderNoEvents() {
    render(this.#noEventsComponent, this.#tripContainer);
  }

  #renderEvents() {
    this.#events.forEach((event) => this.#renderEvent(event));
  }

  #clearTripBoard() {
    this.#eventsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventsPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#eventsListComponent);
  }
}
