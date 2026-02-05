import { CurrencyBrPipe } from './currency-br.pipe';

describe('CurrencyBrPipe', () => {
  let pipe: CurrencyBrPipe;

  beforeEach(() => {
    pipe = new CurrencyBrPipe();
  });

  it('deve criar o pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve formatar número inteiro em BRL', () => {
    const result = pipe.transform(10);

    // evita depender de espaços especiais do locale
    expect(result).toContain('10');
    expect(result).toContain('R$');
  });

  it('deve formatar número decimal corretamente', () => {
    const result = pipe.transform(49.9);

    expect(result).toContain('49,90');
    expect(result).toContain('R$');
  });

  it('deve formatar zero corretamente', () => {
    const result = pipe.transform(0);

    expect(result).toContain('0,00');
  });

  it('deve formatar número grande', () => {
    const result = pipe.transform(1234567.89);

    // pt-BR usa ponto como milhar
    expect(result).toContain('1.234.567,89');
  });

  it('deve retornar string', () => {
    const result = pipe.transform(1);
    expect(typeof result).toBe('string');
  });
});
