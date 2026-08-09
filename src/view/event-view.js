import dayjs from 'dayjs';
import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';

const MINUTES_IN_DAY = 1440;
const MINUTES_IN_HOUR = 60;
const DATE_FORMAT = 'YYYY-MM-DD';
const HTML_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';
const SHORT_DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';

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


const formatEvent = (event, destinationsById, offersById) => {
  const { offers: offerIds, destination: destinationId, isFavorite, dateFrom, dateTo } = event;

  const startDate = dayjs(dateFrom);
  const endDate = dayjs(dateTo);

  const eventDate = startDate.format(DATE_FORMAT);
  const shortDate = startDate.format(SHORT_DATE_FORMAT);
  const startDatetime = startDate.format(HTML_DATE_TIME_FORMAT);
  const endDatetime = endDate.format(HTML_DATE_TIME_FORMAT);
  const startTime = startDate.format(TIME_FORMAT);
  const endTime = endDate.format(TIME_FORMAT);
  const duration = humanizeDuration(endDate.diff(startDate, 'minute'));

  const favoriteButtonClassName = isFavorite
    ? 'event__favorite-btn--active'
    : '';

  const offers = offerIds
    .map((id) => offersById.get(id))
    .filter(Boolean);
  const destination = destinationsById.get(destinationId)?.name ?? '';

  return {
    ...event,
    offers,
    destination,
    eventDate,
    shortDate,
    startDatetime,
    endDatetime,
    startTime,
    endTime,
    duration,
    favoriteButtonClassName,
  };
};

const createOffersTemplate = (offers) =>
  offers
    .map(({ title, price }) => `
      <li class="event__offer">
        <span class="event__offer-title">${he.encode(title)}</span>
          &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </li>
    `).join('');

const createEventTemplate = (event, destinationsById, offersById) => {
  const formattedEvent = formatEvent(event, destinationsById, offersById);
  const {destination, type, price, offers, eventDate, shortDate, startTime, endTime, startDatetime, endDatetime, duration, favoriteButtonClassName} = formattedEvent;

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${eventDate}">${shortDate}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${he.encode(destination)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${startDatetime}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${endDatetime}">${endTime}</time>
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
        <button class="event__favorite-btn ${favoriteButtonClassName}" type="button">
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

export default class EventView extends AbstractView {
  #event = null;
  #destinationsById = null;
  #offersById = null;
  #handleEditOpen = null;
  #handleFavoriteClick = null;

  constructor({ event, destinationsById, offersById, onEditOpen, onFavoriteClick }) {
    super();
    this.#event = event;
    this.#destinationsById = destinationsById;
    this.#offersById = offersById;
    this.#handleEditOpen = onEditOpen;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editOpenHandler);

    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createEventTemplate(this.#event, this.#destinationsById, this.#offersById);
  }

  #editOpenHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditOpen();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
