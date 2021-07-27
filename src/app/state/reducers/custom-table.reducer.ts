import { Action, createReducer, on } from "@ngrx/store";
import * as TableAction from '../actions/custom-table.action';

export enum sortingConst {
    nofilter = 0,
    asc = 1,
    desc = 2
}
export interface Filter {
    columnName? : string,
    columnOrder?: sortingConst,
    filterValue? : string
}

export interface State {
    // defines how the state should be
    data : any[],
    loading : boolean,
    filter : Filter,
}

export const initialState : State = {
    data : [],
    loading : true,
    filter : {
        columnName : '',
        columnOrder : 0
    },
}

const tableReducer = createReducer(
    initialState,
    on(TableAction.getData, (state) => ({...state, loading : true})),
    on(TableAction.getDataSuccess, (state, data) => {
        return ({...state, loading : false, data : data.data})
    }),
    on(TableAction.getDataFailure, (state) => ({...state, loading : false, data : []})),
    on(TableAction.setDataFilter, (state, payload) => {
        let nextState = payload.columnOrder === 0 ? 1 : payload.columnOrder === 1 ? 2 : 0
        // calculate next state from current state
        return {...state, filter : {
            columnName : payload.columnName !== undefined ? payload.columnName : state.filter.columnName, 
            columnOrder : payload.columnOrder !== undefined ? nextState: state.filter.columnOrder,
            filterValue : payload.filterValue !== undefined ? payload.filterValue : state.filter.filterValue
        }}
    })
)

export function reducer(state : State | undefined, action: Action):any {
    return tableReducer(state, action)
}

export const getTableInfo = (state: State) => {
    return {
        data : state.data,
        loading: state.loading,
        filters : state.filter
    }
}

