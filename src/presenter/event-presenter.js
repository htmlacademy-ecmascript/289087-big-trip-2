import { remove, render, replace } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import EventView from '../view/event-view.js';

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
  #destinationsById = null;
  #destinationsByName = null;
  #mode = Mode.DEFAULT;

  constructor({ eventsListContainer, destinationsById, destinationsByName, onDataChange, onModeChange }) {
    this.#eventsListContainer = eventsListContainer;
    this.#destinationsById = destinationsById;
    this.#destinationsByName = destinationsByName;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditFormComponent = this.#eventEditFormComponent;

    this.#eventComponent = new EventView({
      event,
      onEditOpen: this.#handleEditOpen,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditFormComponent = new EventEditFormView({
      event,
      isNewEvent: false,
      destinationsById: this.#destinationsById,
      destinationsByName: this.#destinationsByName,
      onFormSubmit: this.#handleFormSubmit,
      onEditClose: this.#handleEditClose
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

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#eventEditFormComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };

  #handleEditOpen = () => {
    this.#replaceEventToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#event, isFavorite: !this.#event.isFavorite});
  };

  #handleFormSubmit = () => {
    this.#replaceFormToEvent();
  };

  #handleEditClose = () => {
    this.#eventEditFormComponent.reset(this.#event);
    this.#replaceFormToEvent();
  };
}
