import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  // mocks que vamos controlar em cada teste
  let fileReaderMock: any;
  let originalFileReader: any;

  function makeFile(name: string, content: string, type = 'text/csv'): File {
    return new File([content], name, { type });
  }

  function makeEventWithFile(file: File): Event {
    return {
      target: { files: [file] }
    } as unknown as Event;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;

    // Spy nos outputs
    spyOn(component.csvLoaded, 'emit');
    spyOn(component.clearWarnings, 'emit');

    // Spy no localStorage
    spyOn(localStorage, 'setItem');

    // Mock do FileReader
    originalFileReader = (window as any).FileReader;

    fileReaderMock = {
      result: null,
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
      readAsText: function () {
        // o teste decide se chama onload/onerror
      }
    };

    (window as any).FileReader = function () {
      return fileReaderMock;
    };
  });

  afterEach(() => {
    (window as any).FileReader = originalFileReader;
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve mostrar erro e emitir clearWarnings quando arquivo não for .csv', () => {
    const file = makeFile('teste.txt', 'qualquer coisa', 'text/plain');
    const event = makeEventWithFile(file);

    component.onFileSelected(event);

    expect(component.clearWarnings.emit).toHaveBeenCalled();
    expect(component.csvLoaded.emit).not.toHaveBeenCalled();

    expect(component.messageType).toBe('error');
    expect(component.messageText).toContain('formato inválido');
  });

  it('deve mostrar erro e emitir clearWarnings quando cabeçalho for inválido', () => {
    const csvInvalido =
      'produto,qtd,preco\n' +
      'Camiseta,1,10.00\n';

    const file = makeFile('vendas.csv', csvInvalido);
    const event = makeEventWithFile(file);

    component.onFileSelected(event);

    // dispara onload manualmente
    fileReaderMock.result = csvInvalido;
    fileReaderMock.onload();

    expect(component.clearWarnings.emit).toHaveBeenCalled();
    expect(component.csvLoaded.emit).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();

    expect(component.messageType).toBe('error');
    expect(component.messageText).toContain('Cabeçalho inválido');
  });

  it('deve emitir csvLoaded, salvar no localStorage e mostrar success quando CSV for válido', () => {
    const csvValido =
      'produto,quantidade,preco_unitario\n' +
      'Camiseta,2,10\n' +
      'Calça,1,20\n';

    const file = makeFile('vendas.csv', csvValido);
    const event = makeEventWithFile(file);

    component.onFileSelected(event);

    fileReaderMock.result = csvValido;
    fileReaderMock.onload();

    expect(component.clearWarnings.emit).not.toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith('vendas_csv', csvValido);
    expect(component.csvLoaded.emit).toHaveBeenCalledWith(csvValido);

    expect(component.messageType).toBe('success');
    expect(component.messageText).toContain('Arquivo importado com sucesso');
  });

  it('deve emitir csvLoaded e mostrar warn quando header ok mas existirem dados inválidos', () => {
    // header correto, mas linhas inválidas:
    // - quantidade não numérica
    // - preço não numérico
    const csvComDadosInvalidos =
      'produto,quantidade,preco_unitario\n' +
      'Camiseta,abc,49.90\n' +
      'Calça,2,xx\n' +
      'Boné,1,10\n'; // pelo menos 1 linha válida

    const file = makeFile('vendas.csv', csvComDadosInvalidos);
    const event = makeEventWithFile(file);

    component.onFileSelected(event);

    fileReaderMock.result = csvComDadosInvalidos;
    fileReaderMock.onload();

    expect(component.clearWarnings.emit).not.toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith('vendas_csv', csvComDadosInvalidos);
    expect(component.csvLoaded.emit).toHaveBeenCalledWith(csvComDadosInvalidos);

    expect(component.messageType).toBe('warn');
    expect(component.messageText).toContain('existem dados inválidos');
  });

  it('deve emitir clearWarnings e mostrar erro quando FileReader der erro', () => {
    const csvValido =
      'produto,quantidade,preco_unitario\n' +
      'Camiseta,1,10\n';

    const file = makeFile('vendas.csv', csvValido);
    const event = makeEventWithFile(file);

    component.onFileSelected(event);

    fileReaderMock.onerror();

    expect(component.clearWarnings.emit).toHaveBeenCalled();
    expect(component.csvLoaded.emit).not.toHaveBeenCalled();

    expect(component.messageType).toBe('error');
    expect(component.messageText).toContain('Erro ao ler o arquivo');
  });

  it('showWarningForInvalidData deve setar mensagem warn correta', () => {
    component.showWarningForInvalidData();

    expect(component.messageType).toBe('warn');
    expect(component.messageText).toContain('existem dados inválidos');
  });
});
