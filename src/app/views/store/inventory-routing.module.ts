import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryCreateComponent } from "./inventory-create/inventory-create.component";
import { StoreEditComponent } from './store-edit/store-edit.component';
import { StoreListComponent } from './store-list/store-list.component';
import { StorePhotoComponent } from './store-photo/store-photo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InventorydetailsComponent } from './inventorydetails/inventorydetails.component';
import { InventoryeditComponent } from './inventoryedit/inventoryedit.component';
const routes: Routes = [
  {
    path: "list",
    component: StoreListComponent,
  },
  {
    path: "list/:status",
    component: StoreListComponent,
  },
  {
    path: "create",
    component: InventoryCreateComponent,
  },
  {
    path: "edit",
    component: InventoryeditComponent,
  },
  {
    path: "inventory",
    component: InventoryComponent,
  },
  {
    path: "photos",
    component: StorePhotoComponent,
  },
  {
    path: "details",
    component: InventorydetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
