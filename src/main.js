import { render } from './framework/render.js';
import NewEventButtonView from './view/new-event-button-view.js';
import TripBoardPresenter from './presenter/trip-board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import EventsModel from './model/events-model.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';
import OffersModel from './model/offers-model.js';
import EventsApiService from './api-service/events-api-service.js';
import DestinationsApiService from './api-service/destinations-api-service.js';
import OffersApiService from './api-service/offers-api-service.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';

const AUTHORIZATION_BASE = 36;
const AUTHORIZATION_START_INDEX = 2;
const AUTHORIZATION = `Basic ${Math.random().toString(AUTHORIZATION_BASE).slice(AUTHORIZATION_START_INDEX)}`;
const API_ENDPOINT = 'https://22.objects.htmlacademy.pro/big-trip';

const tripEventsElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const tripControlsElement = document.querySelector('.trip-controls__filters');

const eventsModel = new EventsModel({
  eventsApiService: new EventsApiService(API_ENDPOINT, AUTHORIZATION)
});

const destinationsModel = new DestinationsModel({
  destinationsApiService: new DestinationsApiService(API_ENDPOINT, AUTHORIZATION)
});

const offersModel = new OffersModel({
  offersApiService: new OffersApiService(API_ENDPOINT, AUTHORIZATION)
});

const filterModel = new FilterModel();

const tripBoardPresenter = new TripBoardPresenter({
  tripContainer: tripEventsElement,
  eventsModel,
  destinationsModel,
  offersModel,
  filterModel,
  onNewEventClose: handleNewEventFormClose
});

const filterPresenter = new FilterPresenter({
  filtersContainer: tripControlsElement,
  filterModel,
  eventsModel
});

const tripInfoPresenter = new TripInfoPresenter({
  container: tripMainElement,
  eventsModel,
  destinationsModel,
  offersModel,
});

const newEventButtonComponent = new NewEventButtonView({
  onNewEventClick: handleNewEventButtonClick
});

function handleNewEventFormClose() {
  newEventButtonComponent.setDisabled(false);
}

function handleNewEventButtonClick() {
  tripBoardPresenter.createEvent();
  newEventButtonComponent.setDisabled(true);
}

filterPresenter.init();
tripBoardPresenter.init();

Promise.all([
  offersModel.init(),
  destinationsModel.init(),
])
  .then(() => eventsModel.init())
  .then(() => {
    tripInfoPresenter.init();
    render(newEventButtonComponent, tripMainElement);
  })
  .catch(() => {
    tripBoardPresenter.showLoadingError();
  });
