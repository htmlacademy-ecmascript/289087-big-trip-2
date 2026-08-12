import { remove, render, RenderPosition } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import { UserAction, UpdateType, BLANK_EVENT } from '../utils/const.js';

export default class NewEventPresenter {
  #eventsListContainer = null;

  #destinationsModel = null;
  #offersModel = null;

  #handleDataChange = null;
  #handleDestroy = null;

  #eventEditFormComponent = null;

  constructor({
    eventsListContainer,
    destinationsModel,
    offersModel,
    onDataChange,
    onDestroy
  }) {
    this.#eventsListContainer = eventsListContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#eventEditFormComponent !== null) {
      return;
    }

    this.#eventEditFormComponent = new EventEditFormView({
      event: BLANK_EVENT,
      isNewEvent: true,
      destinationsById: this.#destinationsModel.destinationsById,
      destinationsByName: this.#destinationsModel.destinationsByName,
      offersByEventType: this.#offersModel.offersByEventType,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick
    });

    render(this.#eventEditFormComponent, this.#eventsListContainer, RenderPosition.AFTERBEGIN);

    this.#eventEditFormComponent.setEscKeyDownHandler(this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditFormComponent === null) {
      return;
    }

    this.#eventEditFormComponent.removeEscKeyDownHandler(this.#escKeyDownHandler);

    remove(this.#eventEditFormComponent);
    this.#eventEditFormComponent = null;

    this.#handleDestroy();
  }

  setSaving() {
    this.#eventEditFormComponent.updateElement({
      isSaving: true,
    });
  }

  setAborting() {
    if (this.#eventEditFormComponent === null) {
      return;
    }

    this.#eventEditFormComponent.shake(this.#eventEditFormComponent.resetState);
  }

  #handleFormSubmit = (update) => {
    this.#handleDataChange(
      UserAction.ADD_EVENT,
      UpdateType.MINOR,
      update,
    );
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key !== 'Escape') {
      return;
    }

    evt.preventDefault();

    if (this.#eventEditFormComponent.isDisabled) {
      return;
    }

    this.destroy();
  };
}
