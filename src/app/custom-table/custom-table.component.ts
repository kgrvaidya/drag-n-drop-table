import { Component, OnInit, OnDestroy } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import * as tableActions from '../state/actions/custom-table.action';
import * as fromRoot from '../state';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Filter, sortingConst as sorting } from '../state/reducers/custom-table.reducer';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  tableData:any[] = [];
  filteredTableData:any[] = [];
  filters: Filter = {columnName : "", columnOrder : 0};
  isLoading: boolean = false;
  columnList: any[] = [];
  value: string = ''
  inputFilterChange =new Subject();
  name = new FormControl('');
  isEmpty: boolean = false;

  /*
    This is how the sorting logic should work. 
    There will be one columnName and one columnOrder, filterValue values in state. On click, this needs to get updated
    in ngOnInit, subscribe for data change, and once we get data, get filters along with that and apply them on UI and render the result.

  */


  constructor(private readonly store: Store) { 

    this.store.select(fromRoot.getTableInfo).pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      // console.log('data::::', data);
      this.tableData = data.data
      this.isLoading = data.loading
      this.filters = data.filters
      this.columnList = this.tableData.length > 0  && this.columnList.length !== Object.keys(this.tableData[0]).length ? Object.keys(this.tableData[0]) : this.columnList
      this.applyFilters()
    });

    this.name.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(val => {
      // console.log(val)
      this.store.dispatch(tableActions.setDataFilter({filterValue : val}));
    })

  }

  ngOnInit(): void {
    this.store.dispatch(tableActions.getData());
  }

  onRowClick (event: any, name: string): void {
    const order = this.filters?.columnName === name ? this.filters.columnOrder : 0
    this.store.dispatch(tableActions.setDataFilter({columnName : name, columnOrder : order}));
  }

  applyFilters () {
    // take filter, use that filter to filterout values from the list. keep this value in a local array called filteredList
    // first filter out values based on filterValue and later sort them. 
    const {columnName = "", columnOrder = 0, filterValue=''} = this.filters
    if(columnName.length > 0 && columnOrder.toString() || filterValue) {

      let someData = []
      if(filterValue.length > 0) {
        // filter value exists, filter values based on this. 
        // note that, this can be matched with any of the parameter of the table, excluding the header.

        // filter all the values, check for any of the column in the object has a match.
        let columns = Object.keys(this.tableData[0])
        someData = this.tableData.filter(item => {
          let flag = false;
          if(columns && columns.length > 0) {
            columns.forEach(column => {
              if(item[column].toString().toLowerCase().indexOf(filterValue.toLowerCase()) > -1) {
                flag = true;
                return;
              }
              return false
            })
            if(flag) {
              return true
            }
          }
          return false
        })
        this.filteredTableData = [...someData]

      }

        if(columnName.length > 0) {
          // columname exists. For that name apply the filter based on the columnOrder
          // based on the value in order, return the sorted list.
          if(columnOrder === sorting.asc) {
            this.filteredTableData.sort((a,b) => {
              // return this.handleSort(a,b,sorting.asc)
              let valA = a[columnName]
              let valB = b[columnName]
              if(columnName === "id") {
                valA = parseInt(valA)
                valB = parseInt(valB)
              }
              if(valA > valB) {
                return 1
              }
              else if ( valA < valB) {
                return -1
              }
              else return 0
            })
            this.filteredTableData = [...this.filteredTableData]
            
          }
          else if (columnOrder === sorting.desc) {
            this.filteredTableData.sort((a,b) => {
              // if columnName === "id", compare with integer value, not string
              let valA = a[columnName]
              let valB = b[columnName]
              if(columnName === "id") {
                valA = parseInt(valA)
                valB = parseInt(valB)
              }
              if(valA < valB) {
                return 1
              }
              else if ( valA > valB) {
                return -1
              }
              else return 0
            })
            this.filteredTableData = [...this.filteredTableData]
          } else {
            // assign tabledata to filteredTableData, if there's no filterValue. Else apply it to somedata only.
            this.filteredTableData = filterValue.length > 0 ? [...someData] : [...this.tableData]
          }
        }
    } else {
        this.filteredTableData = [...this.tableData]
    }
    if(this.filteredTableData.length === 0) {
      this.isEmpty = true
    } else {
      this.isEmpty = false
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnList, event.previousIndex, event.currentIndex);
  }


  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.destroy$.unsubscribe();
    this.store.dispatch(tableActions.setDataFilter({columnName:'', columnOrder:0, filterValue : ''}));
    // send an action to clear sorting and filter values
  }

}
