import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CurrencyBrPipe } from 'src/app/shared/pipes/currency-br.pipe';
import { UploadComponent } from '../../upload/upload/upload.component';
import { FormsModule } from '@angular/forms';
import { UploadModule } from '../../upload/upload/upload.module';


@NgModule({
  declarations: [
    DashboardComponent,
    CurrencyBrPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,

    TableModule,
    InputTextModule,
    ButtonModule,
    ChartModule,

    ModalModule.forChild(),

    UploadModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
