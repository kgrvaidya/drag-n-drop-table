import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })


export class CustomTableService {
    GET_URL = `https://60ff7b3525741100170789b9.mockapi.io/table`

    constructor(private http : HttpClient) {

    }
    getTableData(){
        return this.http.get(this.GET_URL)
    }
}

