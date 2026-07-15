import SortView from '../view/sort-view.js';
import EventView from '../view/event-view.js';
import EventsListView from '../view/events-list-view.js';
import EventEditFormView from '../view/event-edit-form-view.js';
import { render } from '../render.js';

export default class TripPresenter {
  sortComponent = new SortView();
  eventsListComponent = new EventsListView();

  constructor({ container, eventsModel }) {
    this.container = container;
    this.eventsModel = eventsModel;
  }

  init() {
    this.events = [...this.eventsModel.getEvents()];

    render(this.sortComponent, this.container);
    render(this.eventsListComponent, this.container);
    render(new EventEditFormView({ event: this.events[0], isNewEvent: false }), this.eventsListComponent.getElement());
    render(new EventEditFormView({}), this.eventsListComponent.getElement());


    for (let i = 0; i < this.events.length; i++) {
      render(new EventView({ event: this.events[i] }), this.eventsListComponent.getElement());
    }
  }
}
