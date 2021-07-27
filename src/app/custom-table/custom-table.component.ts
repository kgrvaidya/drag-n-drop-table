import { Component, OnInit, OnDestroy } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import * as tableActions from '../state/actions/custom-table.action';
import * as fromRoot from '../state';
import { Subject,Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  tableData:any[] = [];
  isLoading: boolean = false;
  columnList: any[] = []

  constructor(private readonly store: Store) { 

    this.store.select(fromRoot.getTableInfo).pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      console.log('data::::', data);
      this.tableData = data.data
      this.isLoading = data.loading
      this.columnList = this.tableData.length > 0 ? Object.keys(this.tableData[0]) : []

      // this.tableData.map((row, index) => {
      //   this.columnList.map(column => {
      //     console.log(`Row ${index+1} value for column ${column} : ${row[column]}`)
      //   })
      // })

    });

  }

  ngOnInit(): void {
    this.store.dispatch(tableActions.getData());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.destroy$.unsubscribe();
  }


  // timePeriods = [
  //   'Bronze age',
  //   'Iron age',
  //   'Middle ages',
  //   'Early modern period',
  //   'Long nineteenth century'
  // ];

  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
  // }

}
