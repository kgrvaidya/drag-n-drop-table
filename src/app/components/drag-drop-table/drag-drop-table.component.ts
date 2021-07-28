import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as tableActions from '../../state/actions/custom-table.action';
import * as fromRoot from '../../state';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Filter, sortingConst as sorting } from '../../state/reducers/custom-table.reducer';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'drag-drop-table',
  templateUrl: './drag-drop-table.component.html',
  styleUrls: ['./drag-drop-table.component.scss']
})
export class DragDropTableComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  tableData:any[] = [];
  // filteredTableData:any[] = [];
  filters: Filter = {columnName : "", columnOrder : 0};
  isLoading: boolean = false;
  // columnList: any[] = [];
  // value: string = ''
  name = new FormControl('');
  // isEmpty: boolean = false;
  totalCount: number = 0;
  pageSize: number = 9;
  numberOfPages: number = 0;
  currentPage: number = 1;
  pagesList: number[] = [] // this will hold the current set of pages, not more than 10 at a time. 
  paginatedData: any[] = []

  constructor(private readonly store: Store) { 

    this.store.select(fromRoot.getTableInfo).pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      console.log('data::::', data);
      this.tableData = [...data.data]
      // set pagination detail as soon as page loads
      this.totalCount = this.tableData.length
      // number of pages cant be fraction. If fraction, add 1
      let fraction:number = this.totalCount / this.pageSize
      if(fraction - parseInt(fraction.toString()) > 0) {
        fraction = parseInt(fraction.toString()) + 1;
      }
      this.isLoading = data.loading
      this.filters = data.filters

    });

    this.name.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.store.dispatch(tableActions.setDataFilter({filterValue : val}));
    })

  }

  ngOnInit(): void {
    this.store.dispatch(tableActions.getData());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.destroy$.unsubscribe();
    this.store.dispatch(tableActions.setDataFilter({columnName:'', columnOrder:0, filterValue : ''}));
  }

  onRowClick (event: any): void {
    this.store.dispatch(tableActions.setDataFilter({columnName : event.columnName, columnOrder : event.columnOrder}));
  }

}
