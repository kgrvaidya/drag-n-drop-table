import { Action, createReducer, on } from "@ngrx/store";
import * as TableAction from '../actions/custom-table.action';

export interface State {
    // defines how the state should be
    data : any[],
    loading : boolean,
    searchFilter: string,
    sortedColumn : any,
    sortDirection: any
}

export const initialState : State = {
    data : [],
    loading : true,
    searchFilter : '',
    sortDirection : '',
    sortedColumn : ''
}

const tableReducer = createReducer(
    initialState,
    on(TableAction.getData, (state) => ({...state, loading : true})),
    on(TableAction.getDataSuccess, (state, data) => {
        return ({...state, loading : false, data : data.data})
    }),
    on(TableAction.getDataFailure, (state) => ({...state, loading : false, data : []}))
)

export function reducer(state : State | undefined, action: Action):any {
    return tableReducer(state, action)
}

export const getTableInfo = (state: State) => {
    return {
        data : state.data,
        loading: state.loading
    }
}

