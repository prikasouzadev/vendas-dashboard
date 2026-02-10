import { Component, EventEmitter, Output } from '@angular/core';

type MessageType = 'success' | 'warn' | 'error';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Output() csvLoaded = new EventEmitter<string>(); //manda pro dashboard o conteúdo do CSV
  @Output() clearWarnings = new EventEmitter<void>();// avisa o dashboard para limpar avisos antigos quando um novo arquivo é carregado

  messageText: string | null = null;
  messageType: MessageType = 'success';

  onFileSelected(event: Event): void {
    this.clearMessage();

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // 1) Arquivo não é CSV (extensão inválida)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.clearWarnings.emit(); // limpa avisos do dashboard
      this.setMessage('error', 'Arquivo com formato inválido.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = (reader.result ?? '').toString();

      // 2) Cabeçalho inválido => não processa e limpa avisos antigos
      if (!this.isValidHeader(content)) {
        this.clearWarnings.emit();
        this.setMessage('error', 'Cabeçalho inválido no arquivo CSV.');
        return;
      }

      // 3) Cabeçalho ok => emite CSV sempre (dashboard vai processar)
      localStorage.setItem('vendas_csv', content);
      this.csvLoaded.emit(content);

      // 4) Se tiver linha inválida => aviso amarelo
      const hasInvalidData = this.hasInvalidRows(content);

      if (hasInvalidData) {
        this.setMessage(
          'warn',
          'Arquivo importado com sucesso, mas existem dados inválidos.'
        );
        return;
      }

      // 5) Tudo ok
      this.setMessage('success', 'Arquivo importado com sucesso.');
    };

    reader.onerror = () => {
      this.clearWarnings.emit();
      this.setMessage('error', 'Erro ao ler o arquivo.');
    };

    reader.readAsText(file);
  }

  // ✅ o Dashboard pode chamar isso quando parseErrors > 0
  public showWarningForInvalidData(): void {
    this.setMessage(
      'warn',
      'Arquivo importado com sucesso, mas existem dados inválidos.'
    );
  }

  private isValidHeader(csv: string): boolean {
    const firstLine = csv.split(/\r?\n/)[0].trim();
    return firstLine === 'produto,quantidade,preco_unitario';
  }

  private hasInvalidRows(csv: string): boolean {
    const lines = csv.split(/\r?\n/).slice(1); // pula header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(c => c.trim());
      if (cols.length !== 3) return true;

      const [produto, quantidadeStr, precoStr] = cols;

      if (!produto) return true;

      const quantidade = Number(quantidadeStr);
      const preco = Number(precoStr);

      // quantidade e preço precisam ser números válidos
      if (!Number.isFinite(quantidade) || quantidade <= 0) return true;
      if (!Number.isFinite(preco) || preco <= 0) return true;
    }

    return false;
  }

  private setMessage(type: MessageType, text: string): void {
    this.messageType = type;
    this.messageText = text;
  }

  private clearMessage(): void {
    this.messageText = null;
  }
}
