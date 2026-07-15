import dayjs from 'dayjs';
import { createElement } from '../render.js';
import { MOCK_OFFERS } from '../mock/offers.js';
import { MOCK_DESTINATIONS } from '../mock/destinations.js';

const MINUTES_IN_DAY = 1440;
const MINUTES_IN_HOUR = 60;
const DATE_FORMAT = 'YYYY-MM-DD';
const HTML_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';
const SHORT_DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';

const offersMap = new Map(
  MOCK_OFFERS
    .flatMap(({ offers }) => offers)
    .map((offer) => [offer.id, offer])
);

const destinationsMap = new Map(
  MOCK_DESTINATIONS.map((destination) => [destination.id, destination])
);

const humanizeDuration = (duration) => {
  const days = Math.floor(duration / MINUTES_IN_DAY);
  const hours = Math.floor((duration % MINUTES_IN_DAY) / MINUTES_IN_HOUR);
  const minutes = duration % MINUTES_IN_HOUR;

  return [
    days && `${String(days).padStart(2, '0')}D`,
    (days || hours) && `${String(hours).padStart(2, '0')}H`,
    `${String(minutes).padStart(2, '0')}M`,
  ]
    .filter(Boolean)
    .join(' ');
};


const formatEvent = (event) => {
  const {offers: offersIds, destination: destinationId, isFavorite, startTime, finishTime} = event;
  const start = dayjs(startTime);
  const end = dayjs(finishTime);

  const eventDate = start.format(DATE_FORMAT);
  const shortDate = start.format(SHORT_DATE_FORMAT);
  const startDate = start.format(HTML_DATE_TIME_FORMAT);
  const endDate = end.format(HTML_DATE_TIME_FORMAT);
  const startClock = start.format(TIME_FORMAT);
  const endClock = end.format(TIME_FORMAT);
  const duration = humanizeDuration(end.diff(start, 'minute'));

  const favoriteClassName = isFavorite && 'event__favorite-btn--active';

  const offers = offersIds
    .map((id) => offersMap.get(id))
    .filter(Boolean);
  const destination = destinationsMap.get(destinationId)?.name ?? '';

  return {
    ...event,
    offers,
    destination,
    eventDate,
    shortDate,
    startDate,
    endDate,
    startClock,
    endClock,
    duration,
    favoriteClassName,
  };
};

const createOffersTemplate = (offers) =>
  offers.map(({ title, price }) => `
      <li class="event__offer">
        <span class="event__offer-title">${title}</span>
          &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </li>
    `).join('');

const createEventTemplate = (event) => {
  const view = formatEvent(event);
  const {destination, type, price, offers, eventDate, shortDate, startClock, endClock, startDate, endDate, duration, favoriteClassName} = view;

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${eventDate}">${shortDate}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${destination}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${startDate}">${startClock}</time>
            &mdash;
            <time class="event__end-time" datetime="${endDate}">${endClock}</time>
          </p>
          <p class="event__duration">${duration}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${price}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${createOffersTemplate(offers)}
        </ul>
        <button class="event__favorite-btn ${favoriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
};

export default class EventView {
  constructor({ event }) {
    this.event = event;
  }

  getTemplate() {
    return createEventTemplate(this.event);
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
