import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  } from '@ngrx/store';
import * as tableReducer from './reducers/custom-table.reducer';

export interface State {
    table : tableReducer.State
}

export const reducers: ActionReducerMap<State> = {
    table: tableReducer.reducer,
  };

  export const getTableState = createFeatureSelector<tableReducer.State>('table');

  export const getTableInfo = createSelector(
    getTableState,
    tableReducer.getTableInfo
  );