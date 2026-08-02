import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import { remove, render } from '../framework/render.js';
import NoEventsView from '../view/no-events-view.js';
import EventPresenter from './event-presenter.js';
import { SortType, UpdateType, UserAction } from '../utils/const.js';
import { compareByDate, compareByPrice, compareByTime } from '../utils/sort.js';

export default class TripBoardPresenter {
  #tripContainer = null;
  #eventsModel = null;
  #destinationsModel = null;

  #sortComponent = null;
  #eventsListComponent = new EventsListView();
  #noEventsComponent = new NoEventsView();

  #eventsPresenters = new Map();
  #currentSortType = SortType.DEFAULT;

  constructor({ tripContainer, eventsModel, destinationsModel }) {
    this.#tripContainer = tripContainer;
    this.#eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#eventsModel.addObserver(this.#handleModelAction);
  }

  get events() {
    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...this.#eventsModel.events].sort(compareByTime);
      case SortType.PRICE:
        return [...this.#eventsModel.events].sort(compareByPrice);
      case SortType.DEFAULT:
        return [...this.#eventsModel.events].sort(compareByDate);
    }

    return this.#eventsModel.events;
  }

  init() {
    this.#renderTripBoard();
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearTripBoard();
    this.#renderTripBoard();
  };

  #handleModeChange = () => {
    this.#eventsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventsModel.updateEvent(updateType, update);
        break;
      case UserAction.ADD_EVENT:
        this.#eventsModel.addEvent(updateType, update);
        break;
      case UserAction.DELETE_EVENT:
        this.#eventsModel.deleteEvent(updateType, update);
        break;
    }
  };

  #handleModelAction = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventsPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearTripBoard();
        this.#renderTripBoard();
        // this.#renderTripInfo();
        break;
      case UpdateType.MAJOR:
        this.#clearTripBoard(true);
        this.#renderTripBoard();
        // this.#renderTripInfo();
        break;
    }
  };

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      eventsListContainer: this.#eventsListComponent.element,
      destinationsById: this.#destinationsModel.destinationsById,
      destinationsByName: this.#destinationsModel.destinationsByName,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    eventPresenter.init(event);
    this.#eventsPresenters.set(event.id, eventPresenter);
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
    this.events.forEach((event) => this.#renderEvent(event));
  }

  #renderTripBoard() {
    if (this.events.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderEventsList();
    this.#renderEvents();
  }

  #clearTripBoard(resetSortType = false) {
    this.#eventsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventsPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#eventsListComponent);

    remove(this.#noEventsComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  }
}

// при попытке пользователя добавить новую точку маршрута должны сбрасываться фильтры и сортировка;
// скрываться без сохранения любая показанная форма редактирования. Подробности в техническом задании.

// при закрытии формы добавления (любым способом) введённая информация не сохраняется.
// А после сохранения новая точка должна располагаться в порядке сортировки по дате.

