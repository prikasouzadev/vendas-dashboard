import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VendaAgregada } from 'src/app/core/models/venda.model';
import { VendasService } from 'src/app/core/services/vendas.service';
import { UploadComponent } from '../../upload/upload/upload.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('uploadCmp') uploadCmp?: UploadComponent;


  agregadas: VendaAgregada[] = [];
  agregadasFiltradas: VendaAgregada[] = [];
  totalGeral = 0;
  maisVendido: VendaAgregada | null = null;
  filtroProduto = '';
  chartData: any;
  parseErrors: string[] = [];  // quando CSV tem linhas ruins

  modalRef?: BsModalRef;
  produtoSelecionado?: VendaAgregada;

  constructor(
    private vendasService: VendasService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
  const lastCsv = localStorage.getItem('vendas_csv');
  if (lastCsv) {
    this.processarCSV(lastCsv);
  }
}


  onCsvLoaded(csv: string): void {
    this.processarCSV(csv);
  }

  processarCSV(csv: string): void {
  try {
    const { vendas, errors } = this.vendasService.parseCSV(csv);
    this.parseErrors = errors;

    // CASO 1: existem erros
    if (errors.length > 0) {
      this.uploadCmp?.showWarningForInvalidData();
    }

    // CASO 2: não existe nenhuma linha válida
    if (vendas.length === 0) {
      this.agregadas = [];
      this.agregadasFiltradas = [];
      this.totalGeral = 0;
      this.maisVendido = null;
      this.chartData = null;
      return; // ⛔ não tenta renderizar dashboard
    }

    // CASO 3: existem dados válidos
    const agregadas = this.vendasService.agregar(vendas);
    this.agregadas = agregadas;
    this.agregadasFiltradas = agregadas;

    this.totalGeral = this.vendasService.totalGeral(agregadas);
    this.maisVendido = this.vendasService.produtoMaisVendido(agregadas);

    this.atualizarChart(agregadas);
    this.aplicarFiltro();

  } catch (e: any) {
    this.parseErrors = [e?.message || 'Erro ao processar CSV.'];
  }
}

  aplicarFiltro(): void {
    const term = (this.filtroProduto || '').trim().toLowerCase();

    if (!term) {
      this.agregadasFiltradas = [...this.agregadas];
      this.atualizarChart(this.agregadasFiltradas);
      return;
    }

    this.agregadasFiltradas = this.agregadas.filter(a =>
      a.produto.toLowerCase().includes(term)
    );

    this.atualizarChart(this.agregadasFiltradas);
  }

  limparFiltro(): void {
    this.filtroProduto = '';
    this.aplicarFiltro();
  }

  abrirDetalhe(template: TemplateRef<any>, item: VendaAgregada): void {
    this.produtoSelecionado = item;
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  exportarAgregadosCSV(): void {
    const linhas = [
      'produto,quantidade_total,valor_total',
      ...this.agregadas.map(a =>
        `${a.produto},${a.quantidadeTotal},${a.valorTotal.toFixed(2)}`
      )
    ];

    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_agregado.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  private atualizarChart(lista: VendaAgregada[]): void {
    this.chartData = {
      labels: lista.map(x => x.produto),
      datasets: [
        {
          label: 'Quantidade por produto',
          data: lista.map(x => x.quantidadeTotal)
        }
      ]
    };
  }
}
