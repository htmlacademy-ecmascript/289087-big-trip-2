import { remove, render, RenderPosition } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import { UserAction, UpdateType, BLANK_EVENT } from '../utils/const.js';

export default class NewEventPresenter {
  #eventsListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;
  // #handleEditClose = null;

  #eventEditFormComponent = null;

  #destinationsModel = null;
  #offersModel = null;

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
      // onEditClose: this.#handleEditClose,
      onDeleteClick: this.#handleDeleteClick
    });

    render(this.#eventEditFormComponent, this.#eventsListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditFormComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#eventEditFormComponent);
    this.#eventEditFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleFormSubmit = (update) => {
    this.#handleDataChange(
      UserAction.ADD_EVENT,
      UpdateType.MINOR,
      update,
    );
    this.destroy();
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
