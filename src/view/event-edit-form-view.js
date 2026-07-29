import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { BLANK_EVENT, EVENT_TYPES } from '../utils/const.js';
import { MOCK_OFFERS } from '../mock/offers.js';
import { capitalize } from '../utils/common.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

const DISPLAY_DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';
const REGEX_PRICE = /^[1-9]\d*$/;

const offersMap = new Map(
  MOCK_OFFERS.map((item) => [item.type, item.offers])
);

const createTypesTemplate = (currentType) =>
  EVENT_TYPES.map((typeItem) => `<div class="event__type-item">
      <input
        id="event-type-${typeItem}-1"
        class="event__type-input  visually-hidden"
        type="radio"
        name="event-type"
        value="${typeItem}"
        ${typeItem === currentType ? 'checked' : ''}
      >
      <label
        class="event__type-label  event__type-label--${typeItem}"
        for="event-type-${typeItem}-1"
      >
        ${capitalize(typeItem)}
      </label>
    </div>`)
    .join('');

const createTypeWrapperTemplate = (type) => `
  <div class="event__type-wrapper">
    <label class="event__type  event__type-btn" for="event-type-toggle-1">
      <span class="visually-hidden">Choose event type</span>
      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
    </label>
    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

    <div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Event type</legend>
        ${createTypesTemplate(type)}
      </fieldset>
    </div>
  </div>
`;

const createDestinationOptionsTemplate = (destinationsById) =>
  [...destinationsById.values()]
    .map(({ name }) => `<option value="${name}"></option>`)
    .join('');

const createDestinationFieldgroupTemplate = (type, destination, destinationsById) => `
  <div class="event__field-group  event__field-group--destination">
    <label class="event__label  event__type-output" for="event-destination-1">
      ${type}
    </label>
    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination?.name ?? ''}" list="destination-list-1">
    <datalist id="destination-list-1">
      ${createDestinationOptionsTemplate(destinationsById)}
    </datalist>
  </div>
`;

const createTimeFieldgroupTemplate = (startDatetime, endDatetime) => `
  <div class="event__field-group  event__field-group--time">
    <label class="visually-hidden" for="event-start-time-1">From</label>
    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDatetime}">
    &mdash;
    <label class="visually-hidden" for="event-end-time-1">To</label>
    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDatetime}">
  </div>
`;

const createPriceFieldgroupTemplate = (price) => `
  <div class="event__field-group  event__field-group--price">
    <label class="event__label" for="event-price-1">
      <span class="visually-hidden">Price</span>
      &euro;
    </label>
    <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${price}">
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
      <h3 class="event__section-title  event__section-title--destination">${name}</h3>
      ${description
    ? `<p class="event__destination-description">${description}</p>`
    : ''}

      ${pictures.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictures.map((photo) => `
            <img class="event__photo" src="${photo.src}" alt="${photo.description}">
          `).join('')}
            </div>
          </div>`
    : ''}
    </section>
  `;
};

const createOffersTemplate = (type, selectedOffers) => {
  const availableOffers = offersMap.get(type) ?? [];

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
              id="event-offer-${id}"
              type="checkbox"
              name="event-offer-${id}"
              value="${id}"
              ${selectedOffers.includes(id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${id}">
              <span class="event__offer-title">${title}</span>
                &plus;&euro;&nbsp;
              <span class="event__offer-price">${price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  `;
};

const createDetailsTemplate = (type, offers, destination) => {
  const offersTemplate = createOffersTemplate(type, offers);
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
  const {destination: destinationId, dateFrom, dateTo} = event;

  const startDatetime = dateFrom
    ? dayjs(dateFrom).format(DISPLAY_DATE_TIME_FORMAT)
    : '';
  const endDatetime = dateTo
    ? dayjs(dateTo).format(DISPLAY_DATE_TIME_FORMAT)
    : '';

  const destination = destinationsById.get(destinationId) ?? null;

  return {
    ...event,
    destination,
    startDatetime,
    endDatetime,
  };
};

const createEventEditFormTemplate = (event, isNewEvent, destinationsById) => {
  const view = formatEvent(event, destinationsById);
  const {destination, type, price, offers, startDatetime, endDatetime} = view;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${createTypeWrapperTemplate(type)}
          ${createDestinationFieldgroupTemplate(type, destination, destinationsById)}
          ${createTimeFieldgroupTemplate(startDatetime, endDatetime)}
          ${createPriceFieldgroupTemplate(price)}

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">
            ${isNewEvent ? 'Cancel' : 'Delete'}
          </button>

          ${isNewEvent ? '' : `
            <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
            </button>
            `}
        </header>
        ${createDetailsTemplate(type, offers, destination)}
      </form>
    </li>`
  );
};

export default class EventEditFormView extends AbstractStatefulView {
  #isNewEvent = null;
  #handleFormSubmit = null;
  #handleEditClose = null;
  #destinationsById = null;
  #destinationsByName = null;

  #startDatePicker = null;
  #endDatePicker = null;

  constructor({
    event = BLANK_EVENT,
    isNewEvent = true,
    destinationsById,
    destinationsByName,
    onFormSubmit,
    onEditClose
  }) {
    super();
    this._setState(EventEditFormView.parseEventToState(event));

    this.#isNewEvent = isNewEvent;
    this.#destinationsById = destinationsById;
    this.#destinationsByName = destinationsByName;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleEditClose = onEditClose;

    this._restoreHandlers();
  }

  get template() {
    return createEventEditFormTemplate(this._state, this.#isNewEvent, this.#destinationsById);
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

  reset(event) {
    this.updateElement(
      EventEditFormView.parseEventToState(event),
    );
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editCloseHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('change', this.#eventTypeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceChangeHandler);

    this.element
      .querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offersCheckHandler);

    this.#setDatepickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EventEditFormView.parseStatetoEvent(this._state));
  };

  #editCloseHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClose();
  };

  #eventTypeChangeHandler = ({ target }) => {
    this.updateElement({
      type: target.value,
      offers: []
    });
  };

  #destinationChangeHandler = ({ target }) => {
    if (!this.#destinationsByName.has(target.value)) {
      target.setCustomValidity('Choose from suggested values');
      target.reportValidity();
      return;
    }

    const destination = this.#destinationsByName.get(target.value);

    this.updateElement({
      destination: destination.id,
    });
  };

  #priceChangeHandler = ({ target }) => {
    const { value } = target;

    if (!REGEX_PRICE.test(value)) {
      target.setCustomValidity('Enter a positive integer');
      target.reportValidity();
      return;
    }

    target.setCustomValidity('');

    this._setState({
      price: Number(value),
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

  #startDateChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate,
    });
    this.#endDatePicker.set('minDate', this._state.dateFrom);
  };

  #endDateChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate,
    });
    this.#startDatePicker.set('maxDate', this._state.dateTo);
  };

  #setDatepickers() {
    this.#startDatePicker = flatpickr(
      this.element.querySelector('input[name="event-start-time"]'),
      {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onClose: this.#startDateChangeHandler,
      },
    );

    this.#endDatePicker = flatpickr(
      this.element.querySelector('input[name="event-end-time"]'),
      {
        enableTime: true,
        'time_24hr': true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onClose: this.#endDateChangeHandler,
      },
    );
  }

  static parseEventToState(event) {
    return {...event};
  }

  static parseStatetoEvent(state) {
    const event = {...state};

    return event;
  }
}
