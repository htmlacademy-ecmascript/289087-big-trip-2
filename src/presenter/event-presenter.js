import { remove, render, replace } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import EventView from '../view/event-view.js';
import { UserAction, UpdateType } from '../utils/const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};

export default class EventPresenter {
  #eventsListContainer = null;

  #destinationsModel = null;
  #offersModel = null;

  #handleDataChange = null;
  #handleModeChange = null;

  #eventComponent = null;
  #eventEditFormComponent = null;

  #event = null;
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
      this.#mode = Mode.DEFAULT;
    }

    remove(prevEventComponent);
    remove(prevEventEditFormComponent);
  }

  destroy() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.removeEscKeyDownHandler(this.#escKeyDownHandler);
    }
    remove(this.#eventComponent);
    remove(this.#eventEditFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToEvent();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.updateElement({
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditFormComponent.updateElement({
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#eventComponent.shake();
      return;
    }

    this.#eventEditFormComponent.shake(this.#eventEditFormComponent.resetState);
  }

  #replaceFormToEvent() {
    this.#eventEditFormComponent.reset(this.#event);
    this.#eventEditFormComponent.removeEscKeyDownHandler(this.#escKeyDownHandler);
    replace(this.#eventComponent, this.#eventEditFormComponent);
    this.#mode = Mode.DEFAULT;
  }

  #replaceEventToForm() {
    this.#handleModeChange();
    replace(this.#eventEditFormComponent, this.#eventComponent);
    this.#eventEditFormComponent.setEscKeyDownHandler(this.#escKeyDownHandler);
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
  };

  #handleDeleteClick = (update) => {
    this.#handleDataChange(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      update
    );
  };

  #handleEditClose = () => {
    this.#replaceFormToEvent();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key !== 'Escape') {
      return;
    }

    evt.preventDefault();

    if (this.#eventEditFormComponent.isDisabled) {
      return;
    }

    this.#replaceFormToEvent();
  };
}
