import dayjs from 'dayjs';
import { createElement } from '../render.js';
import { BLANK_EVENT, EVENT_TYPES } from '../const.js';
import { MOCK_DESTINATIONS } from '../mock/destinations.js';
import { MOCK_OFFERS } from '../mock/offers.js';
import { capitalize } from '../utils.js';

const DISPLAY_DATE_TIME_FORMAT = 'DD/MM/YY HH:mm';

const destinationsMap = new Map(
  MOCK_DESTINATIONS.map((destination) => [destination.id, destination])
);

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
  const offers = offersMap.get(type) ?? [];

  if (offers.length === 0) {
    return '';
  }

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">
        Offers
      </h3>

      <div class="event__available-offers">
        ${offers.map(({ id, title, price }) => `
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

const createDestinationOptionsTemplate = () =>
  MOCK_DESTINATIONS
    .map(({ name }) => `<option value="${name}"></option>`)
    .join('');

const formatEvent = (event) => {
  const {destination: destinationId, startTime, finishTime} = event;

  const start = dayjs(startTime);
  const end = dayjs(finishTime);
  const startDate = start.format(DISPLAY_DATE_TIME_FORMAT);
  const endDate = end.format(DISPLAY_DATE_TIME_FORMAT);

  const destination = destinationsMap.get(destinationId) ?? null;

  return {
    ...event,
    destination,
    startDate,
    endDate,
  };
};

const createEventEditFormTemplate = (event, isNewEvent) => {
  const view = formatEvent(event);
  const {destination, type, price, offers, startDate, endDate} = view;

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
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

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destination?.name ?? ''}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationOptionsTemplate()}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${startDate}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${endDate}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${price}">
          </div>

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
        <section class="event__details">
          ${createOffersTemplate(type, offers)}
          ${createDestinationTemplate(destination)}
        </section>
      </form>
    </li>`
  );
};

export default class EventEditFormView {
  constructor({
    event = BLANK_EVENT,
    isNewEvent = true,
  }) {
    this.event = event;
    this.isNewEvent = isNewEvent;
  }

  getTemplate() {
    return createEventEditFormTemplate(this.event, this.isNewEvent);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}

