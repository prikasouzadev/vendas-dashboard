import { Injectable } from '@angular/core';
import { Venda, VendaAgregada, ParseResult } from '../models/venda.model';

@Injectable({ providedIn: 'root' })
export class VendasService {
  private readonly expectedHeader = 'produto,quantidade,preco_unitario';

  validateHeader(csv: string): boolean {
    const firstLine = (csv.split('\n')[0] || '').trim();
    return firstLine === this.expectedHeader;
  }

  parseCSV(csv: string): ParseResult {
    if (!this.validateHeader(csv)) {
      throw new Error('Cabeçalho inválido no arquivo CSV.');
    }

    const lines = csv
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // remove header
    const [, ...dataLines] = lines;

    const vendas: Venda[] = [];
    const errors: string[] = [];

    dataLines.forEach((line, idx) => {
      const lineNumber = idx + 2; // idx inicia em 0 e linha 1 é header

      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 3) {
        errors.push(`Linha ${lineNumber}: formato inválido (esperado 3 colunas).`);
        return;
      }

      const [produtoRaw, qtdRaw, precoRaw] = parts;

      const produto = produtoRaw;
      const quantidade = Number(qtdRaw);
      const precoUnitario = Number(precoRaw);

      if (!produto) {
        errors.push(`Linha ${lineNumber}: produto vazio.`);
        return;
      }

      if (!Number.isFinite(quantidade) || Number.isNaN(quantidade)) {
        errors.push(`Linha ${lineNumber}: quantidade inválida ("${qtdRaw}").`);
        return;
      }

      if (!Number.isFinite(precoUnitario) || Number.isNaN(precoUnitario)) {
        errors.push(`Linha ${lineNumber}: preço_unitario inválido ("${precoRaw}").`);
        return;
      }

      if (quantidade <= 0) {
        errors.push(`Linha ${lineNumber}: quantidade deve ser > 0.`);
        return;
      }

      if (precoUnitario < 0) {
        errors.push(`Linha ${lineNumber}: preço_unitario deve ser >= 0.`);
        return;
      }

      vendas.push({
        produto,
        quantidade,
        precoUnitario
      });
    });

    return { vendas, errors };
  }

  agregar(vendas: Venda[]): VendaAgregada[] {
    const map = new Map<string, VendaAgregada>();

    vendas.forEach(v => {
      const atual = map.get(v.produto) || {
        produto: v.produto,
        quantidadeTotal: 0,
        valorTotal: 0
      };

      atual.quantidadeTotal += v.quantidade;
      atual.valorTotal += v.quantidade * v.precoUnitario;

      map.set(v.produto, atual);
    });

    return Array.from(map.values()).sort((a, b) => b.quantidadeTotal - a.quantidadeTotal);
  }

  totalGeral(agregadas: VendaAgregada[]): number {
    return agregadas.reduce((acc, item) => acc + item.valorTotal, 0);
  }

  produtoMaisVendido(agregadas: VendaAgregada[]): VendaAgregada | null {
    if (!agregadas.length) return null;
    return agregadas.reduce((best, item) =>
      item.quantidadeTotal > best.quantidadeTotal ? item : best
    , agregadas[0]);
  }
}
