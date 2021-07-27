
import { createAction, props } from '@ngrx/store';

// what are all the actions available for the custom table?
/*
1. Search per column
2. Sort per column and order
3. get data
4. got data
*/

export const GET_DATA = '[Custom Table] Get Data';
export const GET_DATA_SUCCESS = '[Custom Table] Get Data Success';
export const GET_DATA_FAILURE = '[Custom Table] Get Data Failure';

export const getData = createAction(
  GET_DATA,
);

export const getDataSuccess = createAction(
  GET_DATA_SUCCESS,
  props<{data : any[]}>()
)

export const getDataFailure = createAction(
    GET_DATA_FAILURE,
  props<any>()
)

