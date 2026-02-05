import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalheComponent } from './detalhe.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Mock do CurrencyBrPipe (pra não depender da implementação real aqui)
 * Se você preferir usar o pipe real, me mande o código do pipe que eu ajusto.
 */
@Pipe({ name: 'currencyBr' })
class CurrencyBrPipeMock implements PipeTransform {
  transform(value: any): string {
    return `R$ ${value}`;
  }
}

describe('DetalheComponent', () => {
  let component: DetalheComponent;
  let fixture: ComponentFixture<DetalheComponent>;

  let bsModalRefSpy: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    bsModalRefSpy = jasmine.createSpyObj<BsModalRef>('BsModalRef', ['hide']);

    await TestBed.configureTestingModule({
      declarations: [DetalheComponent, CurrencyBrPipeMock],
      providers: [{ provide: BsModalRef, useValue: bsModalRefSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar bsModalRef.hide() ao executar fechar()', () => {
    component.fechar();
    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });

  it('deve renderizar as informações quando produtoSelecionado existir', () => {
    component.produtoSelecionado = {
      produto: 'Camiseta',
      quantidadeTotal: 4,
      valorTotal: 199.6
    } as any;

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Detalhes do Produto');
    expect(el.textContent).toContain('Camiseta');
    expect(el.textContent).toContain('4');
    expect(el.textContent).toContain('R$ 199.6'); // vindo do mock
  });

 
  it('clicar no botão "Fechar" deve chamar fechar() e hide()', () => {
    spyOn(component, 'fechar').and.callThrough();

    component.produtoSelecionado = {
      produto: 'Tênis',
      quantidadeTotal: 1,
      valorTotal: 199.9
    } as any;

    fixture.detectChanges();

    const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();

    btn!.click();

    expect(component.fechar).toHaveBeenCalled();
    expect(bsModalRefSpy.hide).toHaveBeenCalled();
  });
});
