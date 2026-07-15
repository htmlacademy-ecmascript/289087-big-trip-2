import FiltersView from './view/filters-view.js';
import TripPresenter from './presenter/trip-presenter.js';
import TripInfoView from './view/trip-info-view.js';
import { render, RenderPosition } from './render.js';
import EventsModel from './model/events-model.js';

const tripEventsElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const tripControlsElement = document.querySelector('.trip-controls__filters');

const eventsModel = new EventsModel();
const tripPresenter = new TripPresenter({
  container: tripEventsElement,
  eventsModel,
});

render(new TripInfoView(), tripMainElement, RenderPosition.AFTERBEGIN);
render(new FiltersView(), tripControlsElement);

tripPresenter.init();
