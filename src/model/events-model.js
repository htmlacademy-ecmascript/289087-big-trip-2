import { createMockEvent } from '../mock/event.js';

const EVENTS_NUMBER = 7;

export default class EventsModel {
  events = Array.from({ length: EVENTS_NUMBER }, createMockEvent);

  getEvents() {
    return this.events;
  }
}
