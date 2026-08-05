import { remove, render, RenderPosition } from '../framework/render.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import { UserAction, UpdateType, BLANK_EVENT } from '../utils/const.js';
import { generateId } from '../utils/common.js';

export default class NewEventPresenter {
  #eventsListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;
  // #handleEditClose = null;

  #eventEditFormComponent = null;

  #destinationsById = null;
  #destinationsByName = null;
  #offersByEventType = null;

  constructor({ eventsListContainer, destinationsById, destinationsByName, offersByEventType, onDataChange, onDestroy }) {
    this.#eventsListContainer = eventsListContainer;
    this.#destinationsById = destinationsById;
    this.#destinationsByName = destinationsByName;
    this.#offersByEventType = offersByEventType;
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
      destinationsById: this.#destinationsById,
      destinationsByName: this.#destinationsByName,
      offersByEventType: this.#offersByEventType,
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
      // Пока у нас нет сервера, который бы после сохранения
      // выдывал честный id задачи, нам нужно позаботиться об этом самим
      {id: generateId(), ...update},
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
