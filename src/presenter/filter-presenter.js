import { render, replace, remove } from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import { filter } from '../utils/filter.js';
import { FilterType, UpdateType } from '../utils/const.js';

export default class FilterPresenter {
  #filtersContainer = null;

  #filterModel = null;
  #eventsModel = null;

  #filterComponent = null;

  constructor({ filtersContainer, filterModel, eventsModel }) {
    this.#filtersContainer = filtersContainer;
    this.#filterModel = filterModel;
    this.#eventsModel = eventsModel;

    this.#eventsModel.addObserver(this.#handleModelAction);
    this.#filterModel.addObserver(this.#handleModelAction);
  }

  get filters() {
    const events = this.#eventsModel.events;

    return Object.values(FilterType).map((type) => ({
      type,
      count: filter[type](events).length
    }));
  }

  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FiltersView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filtersContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelAction = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
