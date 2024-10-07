import { Injectable } from '@angular/core';
import {delay, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MockBankService {

  constructor() { }

  getBankRate$(oerRate: string) { // Mock a bank's exchange rate.
    return of(parseFloat(oerRate)*0.95).pipe(delay(3000))
  }
}
