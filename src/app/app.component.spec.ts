import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { VendasService } from './core/services/vendas.service';

describe('AppComponent', () => {
  let vendasServiceSpy: jasmine.SpyObj<VendasService>;

  beforeEach(async () => {
    vendasServiceSpy = jasmine.createSpyObj<VendasService>('VendasService', [
      'parseCSV',
      'agregar',
      'totalGeral',
      'produtoMaisVendido',
      'validateHeader'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [{ provide: VendasService, useValue: vendasServiceSpy }]
    }).compileComponents();
  });

  it('deve criar o app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
