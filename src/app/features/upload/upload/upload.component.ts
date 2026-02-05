import { Component, EventEmitter, Output } from '@angular/core';

type MessageType = 'success' | 'warn' | 'error';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Output() csvLoaded = new EventEmitter<string>();

  messageText: string | null = null;
  messageType: MessageType = 'success';

  onFileSelected(event: Event): void {
    this.clearMessage();

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // 4) Arquivo não é CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.setMessage('error', 'Formato de arquivo inválido. Selecione um CSV.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = (reader.result ?? '').toString();

      // 2) Cabeçalho inválido
      if (!this.isValidHeader(content)) {
        this.setMessage('error', 'Cabeçalho inválido no arquivo CSV.');
        return;
      }

      // salva/emite sempre que o cabeçalho for válido
      localStorage.setItem('vendas_csv', content);
      this.csvLoaded.emit(content);

      // // por padrão: sucesso
      // this.setMessage('success', 'Arquivo importado com sucesso.');
      // // (se tiver dados inválidos, o Dashboard vai trocar para warn)

      this.setMessage('success', 'Arquivo importado.');
      this.csvLoaded.emit(content);
    };

    reader.onerror = () => {
      this.setMessage('error', 'Erro ao ler o arquivo.');
    };

    reader.readAsText(file);
  }

  // ✅ o Dashboard vai chamar isso quando parseErrors > 0
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

  private setMessage(type: MessageType, text: string): void {
    this.messageType = type;
    this.messageText = text;
  }

  private clearMessage(): void {
    this.messageText = null;
  }
}
