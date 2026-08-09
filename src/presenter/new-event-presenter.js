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

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditFormComponent === null) {
      return;
    }

    remove(this.#eventEditFormComponent);
    this.#eventEditFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);

    this.#handleDestroy();
  }

  setSaving() {
    this.#eventEditFormComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#eventEditFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#eventEditFormComponent.shake(resetFormState);
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
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
