import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../utils/const.js';

const createSortTemplate = (currentSortType) => `
  <form class="trip-events__trip-sort trip-sort" action="#" method="get">
    ${Object.values(SortType).map((sortType) => {
    const isDisabled = sortType === SortType.EVENT || sortType === SortType.OFFERS;

    return `
      <div class="trip-sort__item trip-sort__item--${sortType}">
        <input
          id="sort-${sortType}"
          class="trip-sort__input visually-hidden"
          type="radio"
          name="trip-sort"
          value="sort-${sortType}"
          data-sort-type="${sortType}"
          ${currentSortType === sortType ? 'checked' : ''}
          ${isDisabled ? 'disabled' : ''}
        >
        <label
          class="trip-sort__btn"
          for="sort-${sortType}"
        >
          ${sortType}
        </label>
      </div>
    `;
  }).join('')}
  </form>
`;

export default class SortView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({ currentSortType, onSortTypeChange }) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
