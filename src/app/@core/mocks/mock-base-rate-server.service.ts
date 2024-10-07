import { Injectable } from '@angular/core';
import {MockDb} from "./all_rates";
import {delay, Observable, of} from "rxjs";

export interface RateEntry {
  date: string;
  rate: number;
}
interface MockDbEntry {
  name: string;
  rates: {[toRateKey: string]: RateEntry[]}
}

@Injectable({
  providedIn: 'root'
})
export class MockBaseRateServerService {
  private _db: {[fromRateKey: string]: MockDbEntry} = MockDb;
  constructor() { }

  getRate$(fromRate: string, toRate: string): Observable<number> { // mocking the original OER Api
    return of(this._db[fromRate].rates[toRate][0].rate).pipe(delay(Math.floor(Math.random() * (450 - 100 + 1)) + 100));
  }

  getCurrencies$() { // mocking the original OER Api
    const output: {[key:string]: string} = {};
    Object.keys(this._db).forEach(key => {
      output[key] = this._db[key].name;
    })
    return of(output);
  }

  getHistoricalRate$(fromRate: string, toRate: string) {
    const today = new Date();
    const historicalData: RateEntry[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const baseRate = i === 0 ? this._db[fromRate].rates[toRate][0].rate : historicalData[i-1].rate;
      historicalData.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat((baseRate + ((Math.random() - 0.5) * 0.2)).toFixed(4))
      })
    }

    return of(historicalData).pipe(delay(Math.floor(Math.random() * (5600 - 2000 + 1)) + 2000));
  }
}
