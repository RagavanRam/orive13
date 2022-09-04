import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { StoreListComponent } from './store-list/store-list.component';
import { StoreRoutingModule } from './inventory-routing.module';
import { InventoryCreateComponent } from "./inventory-create/inventory-create.component";
import { InventoryComponent } from './inventory/inventory.component';
import { CrystalLightboxModule } from "@crystalui/angular-lightbox";
import { AgmCoreModule } from "@agm/core";
import { StorePhotoComponent } from './store-photo/store-photo.component';
import { StoreEditComponent } from './store-edit/store-edit.component';
import { FormWizardModule } from "src/app/shared/components/form-wizard/form-wizard.module";
import { InventorydetailsComponent } from './inventorydetails/inventorydetails.component';
import { GalleriaModule } from 'primeng/galleria';
import { DatePipe } from '@angular/common';
import { InventoryeditComponent } from './inventoryedit/inventoryedit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RecceDesignModule } from 'src/app/shared/components/recce-design/recce-design.module';

@NgModule({
  declarations: [
    StoreListComponent,
    InventoryCreateComponent,
    InventoryComponent,
    StorePhotoComponent,
    StoreEditComponent,
    InventorydetailsComponent,
    InventoryeditComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    StoreRoutingModule,
    CrystalLightboxModule,
    FormWizardModule,
    GalleriaModule,
    RecceDesignModule,
    NgbModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBkVeM6JL9tLt1qH4sBgu71RNQ6tWuMyTM",
      libraries: ['places']
    }),
  ],
  providers: [DatePipe]
})
export class InventoryModule { }
