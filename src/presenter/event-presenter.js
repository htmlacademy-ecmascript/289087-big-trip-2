import { remove, render, replace } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import EventView from '../view/event-view.js';
import {UserAction, UpdateType} from '../utils/const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class EventPresenter {
  #eventsListContainer = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #eventComponent = null;
  #eventEditFormComponent = null;

  #event = null;
  #destinationsModel = null;
  #offersModel = null;
  #mode = Mode.DEFAULT;

  constructor({
    eventsListContainer,
    destinationsModel,
    offersModel,
    onDataChange,
    onModeChange
  }) {
    this.#eventsListContainer = eventsListContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditFormComponent = this.#eventEditFormComponent;

    this.#eventComponent = new EventView({
      event,
      destinationsById: this.#destinationsModel.destinationsById,
      offersById: this.#offersModel.offersById,
      onEditOpen: this.#handleEditOpen,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditFormComponent = new EventEditFormView({
      event,
      isNewEvent: false,
      destinationsById: this.#destinationsModel.destinationsById,
      destinationsByName: this.#destinationsModel.destinationsByName,
      offersByEventType: this.#offersModel.offersByEventType,
      onFormSubmit: this.#handleFormSubmit,
      onEditClose: this.#handleEditClose,
      onDeleteClick: this.#handleDeleteClick
    });

    if (prevEventComponent === null || prevEventEditFormComponent === null) {
      render(this.#eventComponent, this.#eventsListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#eventEditFormComponent, prevEventEditFormComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditFormComponent);
  }

  destroy() {
    if (this.#mode === Mode.EDITING) {
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
    remove(this.#eventComponent);
    remove(this.#eventEditFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventEditFormComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  }

  #replaceFormToEvent() {
    replace(this.#eventComponent, this.#eventEditFormComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #replaceEventToForm() {
    replace(this.#eventEditFormComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #handleEditOpen = () => {
    this.#replaceEventToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.PATCH,
      {...this.#event, isFavorite: !this.#event.isFavorite}
    );
  };

  #handleFormSubmit = (update) => {
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      update
    );
    this.#replaceFormToEvent();
  };

  #handleEditClose = () => {
    this.#eventEditFormComponent.reset(this.#event);
    this.#replaceFormToEvent();
  };

  #handleDeleteClick = (update) => {
    this.#handleDataChange(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      update
    );
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#eventEditFormComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };
}
