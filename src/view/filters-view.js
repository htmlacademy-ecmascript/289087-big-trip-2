import AbstractView from '../framework/view/abstract-view.js';

const createFilterItemTemplate = ({ type, count }, currentFilter) => `
  <div class="trip-filters__filter">
    <input
      id="filter-${type}"
      class="trip-filters__filter-input visually-hidden"
      type="radio"
      name="trip-filter"
      value="${type}"
      ${type === currentFilter ? 'checked' : ''}
      ${count === 0 ? 'disabled' : ''}
    >
    <label
      class="trip-filters__filter-label"
      for="filter-${type}"
    >
      ${type}
    </label>
  </div>
`;

const createFiltersTemplate = (filters, currentFilter) => `
  <form class="trip-filters" action="#" method="get">
    ${filters.map((filter) => createFilterItemTemplate(filter, currentFilter)).join('')}

    <button class="visually-hidden" type="submit">
      Accept filter
    </button>
  </form>
`;

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterTypeChange = null;

  constructor({ filters, currentFilterType, onFilterTypeChange }) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilter);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
