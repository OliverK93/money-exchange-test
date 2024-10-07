import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable, take} from "rxjs";
import {CustomHttpService} from "./custom-http.service";
import {MockBaseRateServerService, RateEntry} from "../mocks/mock-base-rate-server.service";

export interface Currency {
  id: string;
  label: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseRateService extends CustomHttpService {
  private _mostUsedCurrencyKeys = ["SGD", "HKD", "CHF", "CNY", "CAD", "AUD", "GBP", "JPY", "EUR", "USD"]

  constructor(http: HttpClient, private mockBaseRateServer: MockBaseRateServerService) {
    super(http);
  }

  getCurrencies$(): Observable<Currency[]> {
    return this.mockBaseRateServer.getCurrencies$().pipe(
        map(currencies => {
          return Object.keys(currencies)
            .map(key => <Currency>{id: key, label: `${currencies[key]} (${key})`, name: currencies[key]})
            .sort((currA, currB) => this._mostUsedCurrencyKeys.indexOf(currA.id) > this._mostUsedCurrencyKeys.indexOf(currB.id) ? -1 : 1);
        }));
  }

  getRate$(fromRate: string, toRate: string): Observable<any> {
    return this.mockBaseRateServer.getRate$(fromRate, toRate);
  }

  getHistoricalDate$(fromRate: string, toRate: string): Observable<RateEntry[]> {
    return this.mockBaseRateServer.getHistoricalRate$(fromRate, toRate);
  }
}
