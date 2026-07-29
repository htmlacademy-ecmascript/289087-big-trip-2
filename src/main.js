import FiltersView from './view/filters-view.js';
import TripInfoView from './view/trip-info-view.js';
import EventsModel from './model/events-model.js';
import TripBoardPresenter from './presenter/trip-board-presenter.js';
import { render, RenderPosition } from './framework/render.js';
import { getFilters } from './mock/filters.js';
import DestinationsModel from './model/destinations-model.js';

const tripEventsElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const tripControlsElement = document.querySelector('.trip-controls__filters');

const eventsModel = new EventsModel();
const destinationsModel = new DestinationsModel();

const tripPresenter = new TripBoardPresenter({
  tripContainer: tripEventsElement,
  eventsModel,
  destinationsModel,
});

const filters = getFilters(eventsModel.events);

render(new TripInfoView(), tripMainElement, RenderPosition.AFTERBEGIN);
render(new FiltersView({ filters }), tripControlsElement);

tripPresenter.init();
