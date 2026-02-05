import { VendasService } from './vendas.service';

describe('VendasService', () => {
  let service: VendasService;

  beforeEach(() => {
    service = new VendasService();
  });

  describe('validateHeader', () => {
    it('deve retornar true quando o cabeçalho for exatamente o esperado', () => {
      const csv = 'produto,quantidade,preco_unitario\nCamiseta,1,10.00';
      expect(service.validateHeader(csv)).toBeTrue();
    });

    it('deve retornar false quando o cabeçalho for diferente', () => {
      const csv = 'produto,qtd,preco\nCamiseta,1,10.00';
      expect(service.validateHeader(csv)).toBeFalse();
    });
  });

  describe('parseCSV', () => {
    it('deve lançar erro quando o cabeçalho for inválido', () => {
      const csv = 'produto,qtd,preco\nCamiseta,1,10.00';

      expect(() => service.parseCSV(csv))
        .toThrowError('Cabeçalho inválido no arquivo CSV.');
    });

    it('deve parsear vendas válidas e retornar errors vazio', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,3,49.90\n' +
        'Calça,2,99.90\n';

      const result = service.parseCSV(csv);

      expect(result.errors).toEqual([]);
      expect(result.vendas.length).toBe(2);

      expect(result.vendas[0]).toEqual({
        produto: 'Camiseta',
        quantidade: 3,
        precoUnitario: 49.9
      });

      expect(result.vendas[1]).toEqual({
        produto: 'Calça',
        quantidade: 2,
        precoUnitario: 99.9
      });
    });

    it('deve ignorar linhas vazias e espaços', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        '\n' +
        '  Camiseta , 1 , 10.00  \n' +
        ' \n';

      const result = service.parseCSV(csv);

      expect(result.errors).toEqual([]);
      expect(result.vendas.length).toBe(1);
      expect(result.vendas[0].produto).toBe('Camiseta');
      expect(result.vendas[0].quantidade).toBe(1);
      expect(result.vendas[0].precoUnitario).toBe(10);
    });

    it('deve registrar erro quando a linha não tiver 3 colunas', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,1\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Linha 2: formato inválido');
    });

    it('deve registrar erro quando produto estiver vazio', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        ',1,10.00\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors[0]).toContain('Linha 2: produto vazio');
    });

    it('deve registrar erro quando quantidade for inválida', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,abc,10.00\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors[0]).toContain('Linha 2: quantidade inválida');
    });

    it('deve registrar erro quando quantidade <= 0', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,0,10.00\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors[0]).toContain('Linha 2: quantidade deve ser > 0.');
    });

    it('deve registrar erro quando preço_unitario for inválido', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,1,xx\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors[0]).toContain('Linha 2: preço_unitario inválido');
    });

    it('deve registrar erro quando preço_unitario < 0', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,1,-1\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(0);
      expect(result.errors[0]).toContain('Linha 2: preço_unitario deve ser >= 0.');
    });

    it('deve aceitar CSV com linhas mistas: retorna vendas válidas e errors das inválidas', () => {
      const csv =
        'produto,quantidade,preco_unitario\n' +
        'Camiseta,2,10\n' +
        'Calça,abc,20\n' +
        'Tênis,1,xx\n' +
        'Boné,1,5\n';

      const result = service.parseCSV(csv);

      expect(result.vendas.length).toBe(2);
      expect(result.vendas.map(v => v.produto)).toEqual(['Camiseta', 'Boné']);

      expect(result.errors.length).toBe(2);
      expect(result.errors[0]).toContain('Linha 3: quantidade inválida');
      expect(result.errors[1]).toContain('Linha 4: preço_unitario inválido');
    });
  });

  describe('agregar', () => {
    it('deve agregar por produto somando quantidadeTotal e valorTotal', () => {
      const vendas: any[] = [
        { produto: 'Camiseta', quantidade: 3, precoUnitario: 10 },
        { produto: 'Calça', quantidade: 2, precoUnitario: 20 },
        { produto: 'Camiseta', quantidade: 1, precoUnitario: 10 }
      ];

      const agregadas = service.agregar(vendas);

      // ordena por quantidadeTotal desc => Camiseta primeiro (4), depois Calça (2)
      expect(agregadas.length).toBe(2);
      expect(agregadas[0]).toEqual({
        produto: 'Camiseta',
        quantidadeTotal: 4,
        valorTotal: 40
      });
      expect(agregadas[1]).toEqual({
        produto: 'Calça',
        quantidadeTotal: 2,
        valorTotal: 40
      });
    });

    it('deve retornar array vazio quando vendas estiver vazio', () => {
      expect(service.agregar([] as any)).toEqual([]);
    });
  });

  describe('totalGeral', () => {
    it('deve somar o valorTotal de todas as agregadas', () => {
      const total = service.totalGeral([
        { produto: 'A', quantidadeTotal: 1, valorTotal: 10 },
        { produto: 'B', quantidadeTotal: 2, valorTotal: 20 }
      ] as any);

      expect(total).toBe(30);
    });

    it('deve retornar 0 quando lista estiver vazia', () => {
      expect(service.totalGeral([] as any)).toBe(0);
    });
  });

  describe('produtoMaisVendido', () => {
    it('deve retornar null quando lista estiver vazia', () => {
      expect(service.produtoMaisVendido([] as any)).toBeNull();
    });

    it('deve retornar o produto com maior quantidadeTotal', () => {
      const best = service.produtoMaisVendido([
        { produto: 'A', quantidadeTotal: 1, valorTotal: 10 },
        { produto: 'B', quantidadeTotal: 5, valorTotal: 20 },
        { produto: 'C', quantidadeTotal: 3, valorTotal: 30 }
      ] as any);

      expect(best?.produto).toBe('B');
      expect(best?.quantidadeTotal).toBe(5);
    });
  });
});
