import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, exhaustMap, catchError, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
// make a new service to fetch API data and import it here
// import action from the custom table action
import * as CustomTableActions from '../actions/custom-table.action';
import { CustomTableService } from '../../services/custom-table.service'

@Injectable()
export class CustomTableEffects {
    constructor(private actions$: Actions, private tableService: CustomTableService) {}

    getTableData$ = createEffect(() => this.actions$.pipe(
        ofType(CustomTableActions.getData),
        mergeMap(() => this.tableService.getTableData()
            .pipe(
                map((result:any) => { 
                    return CustomTableActions.getDataSuccess({data : result})
                },
                catchError((err : any) => of(CustomTableActions.getDataFailure(err)))
                    ))
            )
        )
    )
}


// (response:any) => CustomTableActions.getDataSuccess(response)
                
