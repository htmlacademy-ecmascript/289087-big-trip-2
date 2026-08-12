import { remove, render, RenderPosition } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import SortView from '../view/sort-view.js';
import EventsListView from '../view/events-list-view.js';
import NoEventView from '../view/no-event-view.js';
import LoadingView from '../view/loading-view.js';
import EventPresenter from './event-presenter.js';
import NewEventPresenter from './new-event-presenter.js';
import { filter } from '../utils/filter.js';
import { FilterType, LoadingStatus, SortType, UpdateType, UserAction } from '../utils/const.js';
import { sortByDate, sortByPrice, sortByTime } from '../utils/sort.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000
};

export default class TripBoardPresenter {
  #tripContainer = null;

  #eventsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #handleNewEventClose = null;

  #sortComponent = null;
  #eventsListComponent = new EventsListView();
  #loadingComponent = null;
  #noEventComponent = null;

  #eventsPresenters = new Map();
  #newEventPresenter = null;

  #currentSortType = SortType.DEFAULT;
  #loadingStatus = LoadingStatus.LOADING;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({
    tripContainer,
    eventsModel,
    destinationsModel,
    offersModel,
    filterModel,
    onNewEventClose
  }) {
    this.#tripContainer = tripContainer;
    this.#eventsModel = eventsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;
    this.#handleNewEventClose = onNewEventClose;

    this.#newEventPresenter = new NewEventPresenter({
      eventsListContainer: this.#eventsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewEventDestroy
    });

    this.#eventsModel.addObserver(this.#handleModelAction);
    this.#filterModel.addObserver(this.#handleModelAction);
  }

  get #events() {
    const filterType = this.#filterModel.filter;
    const events = this.#eventsModel.events;
    const filteredEvents = [...filter[filterType](events)];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredEvents.sort(sortByTime);
      case SortType.PRICE:
        return filteredEvents.sort(sortByPrice);
      case SortType.DEFAULT:
      default:
        return filteredEvents.sort(sortByDate);
    }
  }

  init() {
    this.#render();
  }

  createEvent() {
    this.#currentSortType = SortType.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    remove(this.#noEventComponent);

    this.#newEventPresenter.init();
  }

  showLoadingError() {
    this.#loadingStatus = LoadingStatus.FAILURE;
    this.#clear();
    this.#render();
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      eventsListContainer: this.#eventsListComponent.element,
      destinationsModel: this.#destinationsModel,
      offersModel: this.#offersModel,
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

    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  }

  #renderLoading() {
    this.#loadingComponent = new LoadingView({
      status: this.#loadingStatus,
    });

    render(this.#loadingComponent, this.#tripContainer);
  }

  #renderNoEvent() {
    this.#noEventComponent = new NoEventView({
      filterType: this.#filterModel.filter,
    });

    render(this.#noEventComponent, this.#tripContainer);
  }

  #render() {
    switch (this.#loadingStatus) {
      case LoadingStatus.LOADING:
      case LoadingStatus.FAILURE:
        this.#renderLoading();
        return;
    }

    const events = this.#events;

    render(this.#eventsListComponent, this.#tripContainer);

    if (events.length === 0) {
      this.#renderNoEvent();
      return;
    }

    this.#renderSort();
    events.forEach((event) => this.#renderEvent(event));
  }

  #clear(resetSortType = false) {
    this.#newEventPresenter.destroy();

    this.#eventsPresenters.forEach((presenter) => presenter.destroy());
    this.#eventsPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    remove(this.#noEventComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  }

  #handleNewEventDestroy = () => {
    if (this.#events.length === 0) {
      this.#renderNoEvent();
    }

    this.#handleNewEventClose();
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clear();
    this.#render();
  };

  #handleModeChange = () => {
    this.#newEventPresenter.destroy();
    this.#eventsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    try {
      switch (actionType) {
        case UserAction.UPDATE_EVENT:
          this.#eventsPresenters.get(update.id).setSaving();
          await this.#eventsModel.updateEvent(updateType, update);
          break;

        case UserAction.ADD_EVENT:
          this.#newEventPresenter.setSaving();
          await this.#eventsModel.addEvent(updateType, update);
          break;

        case UserAction.DELETE_EVENT:
          this.#eventsPresenters.get(update.id).setDeleting();
          await this.#eventsModel.deleteEvent(updateType, update);
          break;
      }
    } catch (err) {
      switch (actionType) {
        case UserAction.UPDATE_EVENT:
        case UserAction.DELETE_EVENT:
          this.#eventsPresenters.get(update.id).setAborting();
          break;

        case UserAction.ADD_EVENT:
          this.#newEventPresenter.setAborting();
          break;
      }
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleModelAction = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventsPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clear();
        this.#render();
        break;
      case UpdateType.MAJOR:
        this.#clear(true);
        this.#render();
        break;
      case UpdateType.INIT:
        this.#loadingStatus = LoadingStatus.READY;
        this.#clear();
        this.#render();
        break;
    }
  };
}
