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
  totalCount: number = 0;
  pageSize: number = 9;
  numberOfPages: number = 0;
  currentPage: number = 1;
  pagesList: number[] = [] // this will hold the current set of pages, not more than 10 at a time. 
  paginatedData: any[] = []

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
      // set pagination detail as soon as page loads
      this.totalCount = this.tableData.length
      // number of pages cant be fraction. If fraction, add 1
      let fraction:number = this.totalCount / this.pageSize
      if(fraction - parseInt(fraction.toString()) > 0) {
        fraction = parseInt(fraction.toString()) + 1;
      }
      this.numberOfPages = fraction; //this.totalCount / this.pageSize

      this.isLoading = data.loading
      this.filters = data.filters
      this.columnList = this.tableData.length > 0  && this.columnList.length !== Object.keys(this.tableData[0]).length ? Object.keys(this.tableData[0]) : this.columnList
      this.createPageList()
      // this.applyFilters()
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
        let columns = Object.keys(this.paginatedData[0])
        someData = this.paginatedData.filter(item => {
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
            this.filteredTableData = filterValue.length > 0 ? [...someData] : [...this.paginatedData]
          }
        }
    } else {
        this.filteredTableData = [...this.paginatedData]
    }
    if(this.filteredTableData.length === 0) {
      this.isEmpty = true
    } else {
      this.isEmpty = false
    }
  }

  /*
    Few scenarios for pagination.
    1. If the sorting and searching is in place, should we support pagination for that?
    2. On click of paginate, should the filter be cleared?
    3. Should the result have filter pre applied before showing on screen?

    Will go with this flow, 
    First, make the pagination work, then take care of other things.
  */

  nextPage() {
    if(this.currentPage > 0 && this.numberOfPages > this.currentPage) {
      this.currentPage+=1;
      this.createPageList()
    }
  }

  previousPage() {
    if(this.currentPage > 1 && this.currentPage <= this.numberOfPages ) {
      this.currentPage-=1;
      this.createPageList();
    }
  }

  goToPage(pageNumber: number) {
    this.currentPage = pageNumber
    this.getSubArray()
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnList, event.previousIndex, event.currentIndex);
  }

  createPageList = () => {
    let pagesSet = []
    // generate pageList to show for pagination
    if(this.numberOfPages >=this.pageSize) {
      if(this.numberOfPages - this.currentPage >=this.pageSize) {
        // if the current page has atleast 10 more pages
        for(let i=this.currentPage; i<this.currentPage+this.pageSize; i++) {
          pagesSet.push(i)
        }
      }
      else {
        // current page is 9, total pages are 15, hence pagelist will hold 6 to 15
        for(let i = this.numberOfPages - this.pageSize +1; i<=this.numberOfPages; i++) {
          pagesSet.push(i)
        }
        
      }
    } else {
      // there's not more than 10 pages left. If only 1 page, just add that and disable the previous next options
      for(let i=1; i <=this.numberOfPages; i++) {
        pagesSet.push(i)
      }
    }

    this.pagesList = [...pagesSet]
    this.getSubArray()
  }

  getSubArray = () => {
    // current page, and page size and 

    /*
      if current page is 2 and if the pagesize is 20,
      then data will be from index 2*20 + 20 -> currentPage * pageSize + pageSize
    */
    if(this.tableData.length > 0) {
      this.paginatedData = this.tableData.slice((this.currentPage -1 ) * this.pageSize, (this.currentPage -1 ) * this.pageSize + this.pageSize)
      console.log(this.paginatedData)
      this.filteredTableData = [...this.paginatedData]
      this.applyFilters()
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.destroy$.unsubscribe();
    this.store.dispatch(tableActions.setDataFilter({columnName:'', columnOrder:0, filterValue : ''}));
    // send an action to clear sorting and filter values
  }

}
