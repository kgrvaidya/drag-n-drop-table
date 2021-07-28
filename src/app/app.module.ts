import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomTableComponent } from './custom-table/custom-table.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { reducers } from './state';
import { CustomTableEffects } from './state/effects/custom-table.effetcs';
import { EffectsModule } from '@ngrx/effects';
import { ResizeColumnDirective } from './directives/resize-column.directive';


@NgModule({
  declarations: [
    AppComponent,
    CustomTableComponent,
    ResizeColumnDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([CustomTableEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
