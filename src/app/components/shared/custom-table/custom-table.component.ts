import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { Filter, sortingConst as sorting } from '../../../state/reducers/custom-table.reducer';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent implements OnChanges {
  destroy$: Subject<boolean> = new Subject<boolean>();
  
  @Input() tableData:any[] = [];
  @Input() filters: Filter = {columnName : "", columnOrder : 0, filterValue: ''};
  @Input() isLoading: boolean = true;
  @Input() name = new FormControl('');
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pagination:boolean = true;

  columnList: any[] = [];
  filteredTableData:any[] = [];
  isEmpty: boolean = false;
  numberOfPages: number = 0;
  currentPage: number = 1;
  pagesList: number[] = [] // this will hold the current set of pages, not more than 10 at a time. 
  paginatedData: any[] = []

  @Output() onRowClickHandler = new EventEmitter()

  /*
    This is how the sorting logic should work. 
    There will be one columnName and one columnOrder, filterValue values in state. On click, this needs to get updated
  */


  constructor() { 
  }

  initializeTable = () => {
    let fraction:number = this.totalCount / this.pageSize
      if(fraction - parseInt(fraction.toString()) > 0) {
        fraction = parseInt(fraction.toString()) + 1;
      }
      this.numberOfPages = fraction; 

      this.columnList = this.tableData.length > 0  && this.columnList.length !== Object.keys(this.tableData[0]).length ? Object.keys(this.tableData[0]) : this.columnList
      if(this.pagination) {
        this.createPageList()
      }
      else {
        this.paginatedData = [...this.tableData]
      }
      this.applyFilters()
  }

  ngOnChanges() {
    this.initializeTable()
  }

  onRowClick (event: any, name: string): void {
    const order = this.filters?.columnName === name ? this.filters.columnOrder : 0
    this.onRowClickHandler.emit({columnName : name, columnOrder : order})

  }

  applyFilters () {
    // take filter, use that filter to filterout values from the list. keep this value in a local array called filteredList
    // first filter out values based on filterValue and later sort them. 
    const {columnName = "", columnOrder = 0, filterValue=undefined} = this.filters
    if(columnName.length > 0 && columnOrder.toString() || filterValue) {

      let someData = []
      if(filterValue !== undefined) {
        // if pagination is not there, make paginationResult to default array and then filter.
        // filter value exists, filter values based on this. 
        // note that, this can be matched with any of the parameter of the table, excluding the header.
        if(!this.pagination) {
          this.paginatedData = [...this.tableData]
        }

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
          this.filteredTableData = filterValue && filterValue.length > 0 ? [...someData] : [...this.paginatedData]
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

    UPDATE - 
    Pagination works well with filters
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
      // console.log(this.paginatedData)
      this.filteredTableData = [...this.paginatedData]
      this.applyFilters()
    }
  }

}
