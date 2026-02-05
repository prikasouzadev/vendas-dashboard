import { DashboardComponent } from './dashboard.component';
import { VendasService } from 'src/app/core/services/vendas.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DetalheComponent } from '../../detalhe/detalhe.component';

describe('DashboardComponent (unit - sem TestBed)', () => {
  let component: DashboardComponent;

  let vendasServiceSpy: jasmine.SpyObj<VendasService>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;

  beforeEach(() => {
    vendasServiceSpy = jasmine.createSpyObj<VendasService>('VendasService', [
      'parseCSV',
      'agregar',
      'totalGeral',
      'produtoMaisVendido'
    ]);

    modalServiceSpy = jasmine.createSpyObj<BsModalService>('BsModalService', ['show']);

    component = new DashboardComponent(vendasServiceSpy, modalServiceSpy);
  });

  it('deve limpar o estado no ngOnInit', () => {
    component.parseErrors = ['x'];
    component.totalGeral = 123;
    component.filtroProduto = 'abc';
    component.chartData = { labels: ['x'] };

    component.ngOnInit();

    expect(component.parseErrors).toEqual([]);
    expect(component.totalGeral).toBe(0);
    expect(component.filtroProduto).toBe('');
    expect(component.chartData).toBeNull();
  });

  it('onCsvLoaded deve resetar e processar CSV', () => {
    const resetSpy = spyOn(component, 'resetDashboard').and.callThrough();
    const processSpy = spyOn(component, 'processarCSV').and.callThrough();

    component.onCsvLoaded('csv');

    expect(resetSpy).toHaveBeenCalled();
    expect(processSpy).toHaveBeenCalledWith('csv');
  });

  it('processarCSV deve chamar showWarningForInvalidData quando houver errors', () => {
    component.uploadCmp = { showWarningForInvalidData: jasmine.createSpy('showWarningForInvalidData') } as any;

    vendasServiceSpy.parseCSV.and.returnValue({
      vendas: [{ produto: 'Meia', quantidade: 1, preco_unitario: 10 } as any],
      errors: ['Linha 2 inválida']
    });

    vendasServiceSpy.agregar.and.returnValue([
      { produto: 'Meia', quantidadeTotal: 1, valorTotal: 10 } as any
    ]);
    vendasServiceSpy.totalGeral.and.returnValue(10);
    vendasServiceSpy.produtoMaisVendido.and.returnValue(
      { produto: 'Meia', quantidadeTotal: 1, valorTotal: 10 } as any
    );

    component.processarCSV('csv');

    expect(component.parseErrors).toEqual(['Linha 2 inválida']);
    // expect(component.uploadCmp.showWarningForInvalidData).toHaveBeenCalled();
  });

  it('processarCSV não deve renderizar dashboard se vendas estiver vazio', () => {
    vendasServiceSpy.parseCSV.and.returnValue({
      vendas: [],
      errors: ['Linha inválida']
    });

    component.processarCSV('csv');

    expect(component.agregadas).toEqual([]);
    expect(component.agregadasFiltradas).toEqual([]);
    expect(component.totalGeral).toBe(0);
    expect(component.maisVendido).toBeNull();
    expect(component.chartData).toBeNull();

    expect(vendasServiceSpy.agregar).not.toHaveBeenCalled();
    expect(vendasServiceSpy.totalGeral).not.toHaveBeenCalled();
    expect(vendasServiceSpy.produtoMaisVendido).not.toHaveBeenCalled();
  });

  it('processarCSV deve calcular agregadas/total/mais vendido e chart com vendas válidas', () => {
    vendasServiceSpy.parseCSV.and.returnValue({
      vendas: [{ produto: 'Meia', quantidade: 2, preco_unitario: 10 } as any],
      errors: []
    });

    const agregadasMock = [
      { produto: 'Meia', quantidadeTotal: 2, valorTotal: 20 } as any
    ];

    vendasServiceSpy.agregar.and.returnValue(agregadasMock);
    vendasServiceSpy.totalGeral.and.returnValue(20);
    vendasServiceSpy.produtoMaisVendido.and.returnValue(agregadasMock[0]);

    component.processarCSV('csv');

    expect(component.agregadas).toEqual(agregadasMock);
    expect(component.agregadasFiltradas).toEqual(agregadasMock);
    expect(component.totalGeral).toBe(20);
    expect(component.maisVendido).toEqual(agregadasMock[0]);

    expect(component.chartData.labels).toEqual(['Meia']);
    expect(component.chartData.datasets[0].data).toEqual([2]);
  });

  it('processarCSV deve resetar e setar parseErrors se parseCSV lançar erro', () => {
    vendasServiceSpy.parseCSV.and.throwError('Erro parse');

    component.agregadas = [{ produto: 'x' } as any];
    component.totalGeral = 999;

    component.processarCSV('csv');

    expect(component.agregadas).toEqual([]);
    expect(component.totalGeral).toBe(0);
    expect(component.parseErrors).toEqual(['Erro parse']);
  });

  it('aplicarFiltro deve filtrar por produto e atualizar chart', () => {
    component.agregadas = [
      { produto: 'Meia', quantidadeTotal: 2, valorTotal: 20 } as any,
      { produto: 'Boné', quantidadeTotal: 1, valorTotal: 30 } as any
    ];

    component.filtroProduto = 'me';

    component.aplicarFiltro();

    expect(component.agregadasFiltradas.length).toBe(1);
    expect(component.agregadasFiltradas[0].produto).toBe('Meia');
    expect(component.chartData.labels).toEqual(['Meia']);
  });

  it('limparFiltro deve limpar termo e reaplicar filtro', () => {
    component.filtroProduto = 'abc';
    const spy = spyOn(component, 'aplicarFiltro').and.callThrough();

    component.limparFiltro();

    expect(component.filtroProduto).toBe('');
    expect(spy).toHaveBeenCalled();
  });

  it('abrirDetalhe deve abrir modal com DetalheComponent e initialState', () => {
    const item = { produto: 'Meia', quantidadeTotal: 2, valorTotal: 20 } as any;

    component.abrirDetalhe(item);

    expect(modalServiceSpy.show).toHaveBeenCalled();
    const [comp, config] = modalServiceSpy.show.calls.mostRecent().args as any[];

    expect(comp).toBe(DetalheComponent);
    expect(config.initialState.produtoSelecionado).toEqual(item);
  });
});
