import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyBr' })
export class CurrencyBrPipe implements PipeTransform {
  transform(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
