import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {disableElement, fadeInOut, grow, nudgeElement} from "./@core/@theme/components/animations";
import {CommonModule} from "@angular/common";
import {ComponentsModule} from "./@core/@theme/components/components.module";
import {HttpClientModule} from "@angular/common/http";
import {Currency, BaseRateService} from "./@core/services/base-rate.service";
import {map, Observable, of, Subject, switchMap, take, takeUntil, tap} from "rxjs";
import {CustomSelectConfig, CustomSelectInterfaces} from "./@core/@theme/components/custom-select/custom-select-interfaces";
import {CustomInputConfig} from "./@core/@theme/components/custom-input/custom-input-interfaces";
import {CurrencyFormatPipe} from "./@core/pipes/currency-format.pipe";
import {RequestHelper} from "./@core/helpers/request-helper";
import {MockBankService} from "./@core/services/mock-bank.service";
import {RateEntry} from "./@core/mocks/mock-base-rate-server.service";
import {CustomChartConfig} from "./@core/@theme/components/custom-chart/custom-chart-config";

interface Rate {
  baseRate: number;
  bankRate: number;
}

interface CurrencyExchangeDetails {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

interface ValueWithDecimals {
  wholePart: string;
  decimalPart: string;
}

interface CurrencyExchangeResults {
  baseCost: ValueWithDecimals;
  bankCost: ValueWithDecimals;
  difference: ValueWithDecimals;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ComponentsModule, HttpClientModule, CurrencyFormatPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    class: 'host',
  },
  animations: [fadeInOut, disableElement, nudgeElement, grow],
})
export class AppComponent {
  // CONFIGS todo: rethink your choices
  fromCurrencySelectConfig: CustomSelectConfig<Currency> = {
    placeholder: 'Please select Currency...',
    label: 'From',
    bindWhole: true,
  }
  toCurrencySelectConfig: CustomSelectConfig<Currency> = {
    placeholder: 'Please select Currency...',
    label: 'To',
    bindWhole: true,
  }
  amountInputConfig: CustomInputConfig = {
    placeholder: 'Amount',
    label: 'Amount',
    type: 'number',
    formatPipe: CurrencyFormatPipe.transform
  }
  historicalChartConfig: CustomChartConfig = {
    chartData: null,
  }

  // VALUES
  rateCache: {[fromId: string]: {[toId: string]: Rate}} = {};
  historicalrateCache: {[fromId:string] : {[toId: string]: RateEntry[]}} = {};
  baseCurrencyExchangeDetails: CurrencyExchangeDetails = {
    amount: null,
    fromCurrency: null,
    toCurrency: null,
  }
  calculatedCurrencyExchangeDetails: CurrencyExchangeDetails = {
    amount: null,
    fromCurrency: null,
    toCurrency: null,
  }

  currencyExchangeResults: CurrencyExchangeResults = {
    baseCost: null,
    bankCost: null,
    difference: null,
  }

  nudges?: {
    amount?: boolean,
    fromCurrencyId?: boolean,
    toCurrencyId?: boolean,
  } = {};

  // CONTROLLERS
  private _cancelRequests$: Subject<void> = new Subject<void>();
  rateRequestHelper = new RequestHelper<Rate, {fromRate: string, toRate: string}>(
    () =>
      this.baseRateService.getRate$(this.baseCurrencyExchangeDetails.fromCurrency.id, this.baseCurrencyExchangeDetails.toCurrency.id).pipe(
        switchMap(
          (OEDRate: string) => this.mockBankService.getBankRate$(OEDRate)
            .pipe(
              map(bankRate => ({baseRate: parseFloat(OEDRate), bankRate}))
            )
        )),
    {
      cancel$: this._cancelRequests$,
    }
  )

  historicalRequestHelper = new RequestHelper<RateEntry[], {fromRate: string, toRate: string}>(
    () =>this.baseRateService.getHistoricalDate$(this.baseCurrencyExchangeDetails.fromCurrency.id, this.baseCurrencyExchangeDetails.toCurrency.id), {
      cancel$: this._cancelRequests$,
    }
  )

  constructor(private baseRateService: BaseRateService,
              private mockBankService: MockBankService) {
  }

  ngOnInit() {
    this._getCurrencies();
  }

  // UI

  get isButtonDisabled() {
    return !(this.baseCurrencyExchangeDetails.amount &&
      this.baseCurrencyExchangeDetails.fromCurrency && this.baseCurrencyExchangeDetails.toCurrency &&
      this.baseCurrencyExchangeDetails.fromCurrency?.id !== this.baseCurrencyExchangeDetails.toCurrency?.id);
  }

  getNudged(enter: boolean) {
    if (!this.isButtonDisabled) return;
    if (!enter) {
      this.nudges = null;
      return;
    }
    const sameCurrencies = this.baseCurrencyExchangeDetails.fromCurrency?.id === this.baseCurrencyExchangeDetails.toCurrency?.id
    const amount = !this.baseCurrencyExchangeDetails.amount;
    const fromCurrencyId = !this.baseCurrencyExchangeDetails.fromCurrency || sameCurrencies;
    const toCurrencyId = !this.baseCurrencyExchangeDetails.toCurrency || sameCurrencies;
    this.nudges = {amount, fromCurrencyId, toCurrencyId}
  }

  onCurrencyChange() {
    if (this.isButtonDisabled && this.currencyExchangeResults) return;
    this.calculateCosts();
  }

  calculateCosts() {
    this._cancelRequests$.next();
    this._createChartData();
    this._createExchangeDetails();
  }

  swapCurrencies() {
    [this.baseCurrencyExchangeDetails.fromCurrency, this.baseCurrencyExchangeDetails.toCurrency] = [this.baseCurrencyExchangeDetails.toCurrency, this.baseCurrencyExchangeDetails.fromCurrency];
    this.calculateCosts();
  }

  // DATA

  private _getCurrencies() {
    this.baseRateService.getCurrencies$().pipe(take(1)).subscribe(currencies => {
      const selectData: CustomSelectInterfaces<Currency> = {
        options: currencies,
        bindLabel: "label",
        bindKey: "id",
      }
      this.fromCurrencySelectConfig.customSelectData = selectData;
      this.toCurrencySelectConfig.customSelectData = selectData
    })
  }

  private _getRate$():Observable<Rate> {
    const rate = this.rateCache[this.baseCurrencyExchangeDetails.fromCurrency.id]?.[this.baseCurrencyExchangeDetails.toCurrency.id];
    if (rate) return of(rate);
    return this.rateRequestHelper.call().pipe(
      tap(rate => {
        if (!this.rateCache[this.baseCurrencyExchangeDetails.fromCurrency.id]) this.rateCache[this.baseCurrencyExchangeDetails.fromCurrency.id] = {};
        this.rateCache[this.baseCurrencyExchangeDetails.fromCurrency.id][this.baseCurrencyExchangeDetails.toCurrency.id] = rate;
      }),
      take(1),
    )
  }

  private _getHistoricalData$(): Observable<RateEntry[]> {
    const rateEntries = this.historicalrateCache[this.baseCurrencyExchangeDetails.fromCurrency.id]?.[this.baseCurrencyExchangeDetails.toCurrency.id];
    if (rateEntries) return of(rateEntries);
    return this.historicalRequestHelper.call().pipe(
      tap(rateEntries => {
        if (!this.historicalrateCache[this.baseCurrencyExchangeDetails.fromCurrency.id]) this.historicalrateCache[this.baseCurrencyExchangeDetails.fromCurrency.id] = {};
        this.historicalrateCache[this.baseCurrencyExchangeDetails.fromCurrency.id][this.baseCurrencyExchangeDetails.toCurrency.id] = rateEntries;
      }),
      take(1),
    )
  }

  private _createChartData() {
    this.historicalChartConfig.chartData = null;
    this._getHistoricalData$().pipe(take(1)).subscribe((historicalData: RateEntry[]) => {
      this.historicalChartConfig.chartData = {
        data: [
          {
            type: 'spline',
            xValueFormatString: 'YYYY-MM-DD',
            dataPoints: historicalData.map(rateEntry => ({x: new Date(rateEntry.date), y: rateEntry.rate}))
          }
        ]
      }
    })
  }

  private _createExchangeDetails() {
    this.calculatedCurrencyExchangeDetails = {...this.baseCurrencyExchangeDetails, amount: null};
    this.currencyExchangeResults = null;
    this._getRate$().pipe(take(1)).subscribe(rate => {
      this.calculatedCurrencyExchangeDetails.amount = this.baseCurrencyExchangeDetails.amount;
      const baseCostCalculated = this.baseCurrencyExchangeDetails.amount * rate.baseRate
      const bankCostCalculated = this.baseCurrencyExchangeDetails.amount * rate.bankRate
      const baseCost = parseFloat((baseCostCalculated).toFixed(5)).toString().split('.')
      const bankCost =  parseFloat((bankCostCalculated).toFixed(5)).toString().split('.');
      const difference = parseFloat(((baseCostCalculated) - (bankCostCalculated)).toFixed(5)).toString().split('.');
      this.currencyExchangeResults = {
        baseCost: {
          wholePart: CurrencyFormatPipe.transform(baseCost[0]),
          decimalPart: baseCost[1]
        },
        bankCost: {
          wholePart: CurrencyFormatPipe.transform(bankCost[0]),
          decimalPart: bankCost[1],
        },
        difference: {
          wholePart: CurrencyFormatPipe.transform(difference[0]),
          decimalPart: difference[1],
        },
      }
    })
  }
}
