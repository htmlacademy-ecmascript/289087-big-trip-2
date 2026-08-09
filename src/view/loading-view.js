import AbstractView from '../framework/view/abstract-view.js';
import { LoadingStatus } from '../utils/const.js';

const LoadingMessage = {
  [LoadingStatus.LOADING]: 'Loading...',
  [LoadingStatus.FAILURE]: 'Failed to load latest route information'
};

const createLoadingTemplate = (status) => {
  const text = LoadingMessage[status];

  return `<p class="trip-events__msg">${ text }</p>`;
};

export default class LoadingView extends AbstractView {
  #status = null;

  constructor({ status }) {
    super();
    this.#status = status;
  }

  get template() {
    return createLoadingTemplate(this.#status);
  }
}
