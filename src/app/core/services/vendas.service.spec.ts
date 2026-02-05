import { TestBed } from '@angular/core/testing';
import { VendasService } from './vendas.service';

describe('VendasService', () => {
  let service: VendasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendasService);
  });

  it('deve lançar erro quando cabeçalho for inválido', () => {
    const csv = `produto,qtd,preco
Camiseta,1,10`;
    expect(() => service.parseCSV(csv)).toThrowError('Cabeçalho inválido no arquivo CSV.');
  });

  it('deve fazer parse do csv válido sem erros', () => {
    const csv = `produto,quantidade,preco_unitario
Camiseta,3,49.90
Calça,2,99.90`;

    const result = service.parseCSV(csv);

    expect(result.errors.length).toBe(0);
    expect(result.vendas.length).toBe(2);
    expect(result.vendas[0].produto).toBe('Camiseta');
    expect(result.vendas[0].quantidade).toBe(3);
    expect(result.vendas[0].precoUnitario).toBe(49.9);
  });

  it('deve coletar errors para linhas inválidas e manter as válidas', () => {
    const csv = `produto,quantidade,preco_unitario
Camiseta,abc,49.90
Calça,2,99.90
Tênis,1,xx`;

    const { vendas, errors } = service.parseCSV(csv);

    expect(vendas.length).toBe(1);
    expect(vendas[0].produto).toBe('Calça');
    expect(errors.length).toBe(2);
  });

  it('deve agregar por produto corretamente', () => {
    const csv = `produto,quantidade,preco_unitario
Camiseta,3,50
Camiseta,1,50
Calça,2,100`;

    const { vendas } = service.parseCSV(csv);
    const agregadas = service.agregar(vendas);

    const camiseta = agregadas.find(a => a.produto === 'Camiseta')!;
    const calca = agregadas.find(a => a.produto === 'Calça')!;

    expect(camiseta.quantidadeTotal).toBe(4);
    expect(camiseta.valorTotal).toBe(200);

    expect(calca.quantidadeTotal).toBe(2);
    expect(calca.valorTotal).toBe(200);
  });

  it('deve calcular total geral e produto mais vendido', () => {
    const agregadas = [
      { produto: 'A', quantidadeTotal: 2, valorTotal: 100 },
      { produto: 'B', quantidadeTotal: 5, valorTotal: 50 }
    ];

    expect(service.totalGeral(agregadas)).toBe(150);
    expect(service.produtoMaisVendido(agregadas)?.produto).toBe('B');
  });
});
