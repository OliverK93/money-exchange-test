import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: string): any {
    CurrencyFormatPipe.transform(value);
  }

  static transform(value: string): string {
    if (value === null || value === undefined || value === '' || isNaN(parseFloat(value))) {
      return '';
    }

    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(parseInt(value.replace(/,/g, '')));
    return formattedValue
  }

}
