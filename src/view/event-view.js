import dayjs from 'dayjs';
import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';
import { capitalize } from '../utils/common.js';

const DateFormat = {
  FULL_DATE: 'YYYY-MM-DD',
  HTML_DATETIME: 'YYYY-MM-DDTHH:mm',
  SHORT_DATE: 'MMM DD',
  TIME: 'HH:mm',
};

const Time = {
  MINUTES_IN_DAY: 1440,
  MINUTES_IN_HOUR: 60,
};

const DURATION_PART_LENGTH = 2;
const DURATION_PADDING_CHARACTER = '0';

const humanizeDuration = (duration) => {
  const days = Math.floor(duration / Time.MINUTES_IN_DAY);
  const hours = Math.floor((duration % Time.MINUTES_IN_DAY) / Time.MINUTES_IN_HOUR);
  const minutes = duration % Time.MINUTES_IN_HOUR;

  return [
    days && `${String(days).padStart(DURATION_PART_LENGTH, DURATION_PADDING_CHARACTER)}D`,
    (days || hours) && `${String(hours).padStart(DURATION_PART_LENGTH, DURATION_PADDING_CHARACTER)}H`,
    `${String(minutes).padStart(DURATION_PART_LENGTH, DURATION_PADDING_CHARACTER)}M`,
  ]
    .filter(Boolean)
    .join(' ');
};


const formatEvent = (event, destinationsById, offersById) => {
  const { offers: offerIds, destination: destinationId, isFavorite, dateFrom, dateTo } = event;

  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);

  const eventDate = start.format(DateFormat.FULL_DATE);
  const shortDate = start.format(DateFormat.SHORT_DATE);
  const startDatetime = start.format(DateFormat.HTML_DATETIME);
  const endDatetime = end.format(DateFormat.HTML_DATETIME);
  const startTime = start.format(DateFormat.TIME);
  const endTime = end.format(DateFormat.TIME);
  const duration = humanizeDuration(end.diff(start, 'minute'));

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
        <span class="event__offer-price">${he.encode(String(price))}</span>
      </li>
    `).join('');

const createEventTemplate = (event, destinationsById, offersById) => {
  const formattedEvent = formatEvent(event, destinationsById, offersById);
  const { destination, type, price, offers, eventDate, shortDate, startTime, endTime, startDatetime, endDatetime, duration, favoriteButtonClassName } = formattedEvent;

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${eventDate}">${shortDate}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${he.encode(type)}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${he.encode(capitalize(type))} ${he.encode(destination)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${startDatetime}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${endDatetime}">${endTime}</time>
          </p>
          <p class="event__duration">${duration}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${he.encode(String(price))}</span>
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
