import dayjs from 'dayjs';
import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { BLANK_EVENT, EVENT_TYPES } from '../utils/const.js';
import { capitalize } from '../utils/common.js';

const DISPLAY_DATETIME_FORMAT = 'DD/MM/YY HH:mm';

const DATEPICKER_OPTIONS = {
  enableTime: true,
  'time_24hr': true,
  dateFormat: 'd/m/y H:i',
};

const REGEX_PRICE = /^[1-9]\d*$/;

const createEventTypesTemplate = (currentType) =>
  EVENT_TYPES.map((type) => `<div class="event__type-item">
      <input
        id="event-type-${type}-1"
        class="event__type-input  visually-hidden"
        type="radio"
        name="event-type"
        value="${type}"
        ${type === currentType ? 'checked' : ''}
      >
      <label
        class="event__type-label  event__type-label--${type}"
        for="event-type-${type}-1"
      >
        ${capitalize(type)}
      </label>
    </div>`)
    .join('');

const createTypeWrapperTemplate = (type, isDisabled) => `
  <div class="event__type-wrapper">
    <label class="event__type  event__type-btn" for="event-type-toggle-1">
      <span class="visually-hidden">Choose event type</span>
      <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(type)}.png" alt="Event type icon">
    </label>
    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${isDisabled ? 'disabled' : ''}>

    <div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Event type</legend>
        ${createEventTypesTemplate(type)}
      </fieldset>
    </div>
  </div>
`;

const createDestinationOptionsTemplate = (destinationsByName) =>
  [...destinationsByName.keys()]
    .map((name) => `<option value="${he.encode(name)}"></option>`)
    .join('');

const createDestinationFieldgroupTemplate = (type, destination, destinationsByName, isDisabled) => `
  <div class="event__field-group  event__field-group--destination">
    <label class="event__label  event__type-output" for="event-destination-1">
      ${he.encode(capitalize(type))}
    </label>
    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(destination?.name ?? '')}" list="destination-list-1" ${isDisabled ? 'disabled' : ''} required>
    <datalist id="destination-list-1">
      ${createDestinationOptionsTemplate(destinationsByName)}
    </datalist>
  </div>
`;

const createTimeFieldgroupTemplate = (startDatetime, endDatetime, isDisabled) => `
  <div class="event__field-group  event__field-group--time">
    <label class="visually-hidden" for="event-start-time-1">From</label>
    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDatetime}" ${isDisabled ? 'disabled' : ''} required>
    &mdash;
    <label class="visually-hidden" for="event-end-time-1">To</label>
    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDatetime}" ${isDisabled ? 'disabled' : ''} required>
  </div>
`;

const createPriceFieldgroupTemplate = (price, isDisabled) => `
  <div class="event__field-group  event__field-group--price">
    <label class="event__label" for="event-price-1">
      <span class="visually-hidden">Price</span>
      &euro;
    </label>
    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${he.encode(String(price))}" ${isDisabled ? 'disabled' : ''} required>
  </div>
`;

const createDestinationTemplate = (destination) => {
  if (!destination) {
    return '';
  }

  const { name, description, pictures = [] } = destination;

  if (!description && pictures.length === 0) {
    return '';
  }

  return `
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">${he.encode(name)}</h3>
      ${description
    ? `<p class="event__destination-description">${he.encode(description)}</p>`
    : ''}

      ${pictures.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map((photo) => `
            <img class="event__photo" src="${he.encode(photo.src)}" alt="${he.encode(photo.description)}">
          `).join('')}
            </div>
          </div>`
    : ''}
    </section>
  `;
};

const createOffersTemplate = (type, selectedOffers, offersByEventType, isDisabled) => {
  const availableOffers = offersByEventType.get(type) ?? [];

  if (availableOffers.length === 0) {
    return '';
  }

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">
        Offers
      </h3>

      <div class="event__available-offers">
        ${availableOffers.map(({ id, title, price }) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${he.encode(String(id))}"
              type="checkbox"
              name="event-offer-${he.encode(String(id))}"
              value="${he.encode(String(id))}"
              ${selectedOffers.includes(id) ? 'checked' : ''}
              ${isDisabled ? 'disabled' : ''}
            >
            <label class="event__offer-label" for="event-offer-${he.encode(String(id))}">
              <span class="event__offer-title">${he.encode(title)}</span>
                &plus;&euro;&nbsp;
              <span class="event__offer-price">${he.encode(String(price))}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  `;
};

const createDetailsTemplate = (type, selectedOffers, offersByEventType, destination, isDisabled) => {
  const offersTemplate = createOffersTemplate(type, selectedOffers, offersByEventType, isDisabled);
  const destinationTemplate = createDestinationTemplate(destination);

  const detailsTemplate =
    offersTemplate || destinationTemplate
      ? `
        <section class="event__details">
          ${offersTemplate}
          ${destinationTemplate}
        </section>
      `
      : '';

  return detailsTemplate;
};

const formatEvent = (event, destinationsById) => {
  const { destination: destinationId, dateFrom, dateTo } = event;

  const startDatetime = dateFrom
    ? dayjs(dateFrom).format(DISPLAY_DATETIME_FORMAT)
    : '';
  const endDatetime = dateTo
    ? dayjs(dateTo).format(DISPLAY_DATETIME_FORMAT)
    : '';

  const destination = destinationsById.get(destinationId) ?? null;

  return {
    ...event,
    destination,
    startDatetime,
    endDatetime,
  };
};

const createEventEditFormTemplate = (event, isNewEvent, destinationsById, destinationsByName, offersByEventType) => {
  const eventData = formatEvent(event, destinationsById);
  const { destination, type, price, offers, startDatetime, endDatetime, isSaving, isDeleting } = eventData;
  const isDisabled = isSaving || isDeleting;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${createTypeWrapperTemplate(type, isDisabled)}
          ${createDestinationFieldgroupTemplate(type, destination, destinationsByName, isDisabled)}
          ${createTimeFieldgroupTemplate(startDatetime, endDatetime, isDisabled)}
          ${createPriceFieldgroupTemplate(price, isDisabled)}

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
            ${isSaving ? 'Saving...' : 'Save'}
          </button>
          <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>
            ${isNewEvent ? 'Cancel' : `${isDeleting ? 'Deleting...' : 'Delete'}`}
          </button>

          ${isNewEvent ? '' : `
            <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
                <span class="visually-hidden">Open event</span>
            </button>
            `}
        </header>
        ${createDetailsTemplate(type, offers, offersByEventType, destination, isDisabled)}
      </form>
    </li>`
  );
};

export default class EventEditFormView extends AbstractStatefulView {
  #isNewEvent = null;

  #destinationsById = null;
  #destinationsByName = null;
  #offersByEventType = null;

  #handleFormSubmit = null;
  #handleEditClose = null;
  #handleDeleteClick = null;

  #startDatePicker = null;
  #endDatePicker = null;

  constructor({
    event = BLANK_EVENT,
    isNewEvent = true,
    destinationsById,
    destinationsByName,
    offersByEventType,
    onFormSubmit,
    onEditClose,
    onDeleteClick
  }) {
    super();
    this._setState(EventEditFormView.#parseEventToState(event));

    this.#isNewEvent = isNewEvent;
    this.#destinationsById = destinationsById;
    this.#destinationsByName = destinationsByName;
    this.#offersByEventType = offersByEventType;

    this.#handleFormSubmit = onFormSubmit;
    this.#handleEditClose = onEditClose;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  get template() {
    return createEventEditFormTemplate(this._state, this.#isNewEvent, this.#destinationsById, this.#destinationsByName, this.#offersByEventType);
  }

  get isDisabled() {
    return this._state.isSaving || this._state.isDeleting;
  }

  removeElement() {
    super.removeElement();

    if (this.#startDatePicker) {
      this.#startDatePicker.destroy();
      this.#startDatePicker = null;
    }

    if (this.#endDatePicker) {
      this.#endDatePicker.destroy();
      this.#endDatePicker = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#editCloseHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('change', this.#eventTypeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceChangeHandler);

    this.element.querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offersCheckHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#eventDeleteClickHandler);

    this.#setDatepickers();
  }

  reset(event) {
    this.updateElement(
      EventEditFormView.#parseEventToState(event),
    );
  }

  resetState = () => {
    this.updateElement({
      isSaving: false,
      isDeleting: false,
    });
  };

  setEscKeyDownHandler(callback) {
    document.addEventListener('keydown', callback);
  }

  removeEscKeyDownHandler(callback) {
    document.removeEventListener('keydown', callback);
  }

  #setDatepickers() {
    this.#startDatePicker = flatpickr(
      this.element.querySelector('input[name="event-start-time"]'),
      {
        ...DATEPICKER_OPTIONS,
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onClose: this.#startDateChangeHandler,
      },
    );

    this.#endDatePicker = flatpickr(
      this.element.querySelector('input[name="event-end-time"]'),
      {
        ...DATEPICKER_OPTIONS,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onClose: this.#endDateChangeHandler,
      },
    );
  }

  #validatePrice(input) {
    const value = input.value.trim();

    if (!REGEX_PRICE.test(value)) {
      input.setCustomValidity('Enter a positive integer');
    } else {
      input.setCustomValidity('');
    }

    return input.reportValidity();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const priceInput = this.element.querySelector('.event__input--price');
    const isPriceValid = this.#validatePrice(priceInput);

    const hasDates = this._state.dateFrom && this._state.dateTo;

    if (!hasDates || !isPriceValid) {
      return;
    }

    this.#handleFormSubmit(EventEditFormView.#parseStateToEvent(this._state));
  };

  #editCloseHandler = (evt) => {
    evt.preventDefault();

    if (this.isDisabled) {
      return;
    }

    this.#handleEditClose();
  };

  #eventTypeChangeHandler = ({ target }) => {
    this.updateElement({
      type: target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = ({ target }) => {
    if (!this.#destinationsByName.has(target.value)) {
      target.setCustomValidity('Choose from suggested values');
      target.reportValidity();
      return;
    }

    target.setCustomValidity('');

    const destination = this.#destinationsByName.get(target.value);

    this.updateElement({
      destination: destination.id,
    });
  };

  #priceChangeHandler = ({ target }) => {
    if (target.value === '') {
      return;
    }

    if (!this.#validatePrice(target)) {
      return;
    }

    this._setState({
      price: Number(target.value),
    });
  };

  #offersCheckHandler = ({ target }) => {
    const offerId = target.value;

    const offers = target.checked
      ? [...this._state.offers, offerId]
      : this._state.offers.filter((id) => id !== offerId);

    this._setState({
      offers,
    });
  };

  #eventDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EventEditFormView.#parseStateToEvent(this._state));
  };

  #startDateChangeHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate,
    });
    this.#endDatePicker.set('minDate', this._state.dateFrom);
  };

  #endDateChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
    this.#startDatePicker.set('maxDate', this._state.dateTo);
  };

  static #parseEventToState(event) {
    return {
      ...event,
      isSaving: false,
      isDeleting: false
    };
  }

  static #parseStateToEvent(state) {
    const event = {...state};

    delete event.isSaving;
    delete event.isDeleting;

    return event;
  }
}
