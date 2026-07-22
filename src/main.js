import FiltersView from './view/filters-view.js';
import TripInfoView from './view/trip-info-view.js';
import EventsModel from './model/events-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import { render, RenderPosition } from './framework/render.js';
import { getFilters } from './mock/filters.js';

const tripEventsElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const tripControlsElement = document.querySelector('.trip-controls__filters');

const eventsModel = new EventsModel();
const tripPresenter = new TripPresenter({
  tripContainer: tripEventsElement,
  eventsModel,
});

const filters = getFilters(eventsModel.events);

render(new TripInfoView(), tripMainElement, RenderPosition.AFTERBEGIN);
render(new FiltersView({ filters }), tripControlsElement);

tripPresenter.init();
