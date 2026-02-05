import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { DashboardModule } from './features/dashboard/dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    PageHeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    ButtonModule,
    TableModule,
    InputTextModule,

    ModalModule.forRoot(),

    DashboardModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
