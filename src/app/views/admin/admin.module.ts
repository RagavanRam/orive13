import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination';

import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InventoryApprovalComponent } from './inventory-approval/inventory-approval.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CrystalLightboxModule } from '@crystalui/angular-lightbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDatatableModule,
    CrystalLightboxModule,
    NgbModule,
    AdminRoutingModule,
  ],
  declarations: [InventoryApprovalComponent],
})
export class AdminModule {}
