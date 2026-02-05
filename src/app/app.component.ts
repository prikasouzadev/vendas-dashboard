import { Component , TemplateRef} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VendasService } from './core/services/vendas.service';
import { VendaAgregada } from './core/models/venda.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private vendasService: VendasService) {}

}
