import { FilterType } from '../utils/const.js';
import { filter } from '../utils/filter.js';

export const getFilters = (events, currentFilter = FilterType.EVERYTHING) => Object.entries(filter).map(
  ([filterType, filterEvents]) => ({
    type: filterType,
    isDisabled: filterEvents(events).length === 0,
    isChecked: currentFilter === filterType,
  }),
);
