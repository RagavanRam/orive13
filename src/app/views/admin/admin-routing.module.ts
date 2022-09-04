import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryApprovalComponent } from "./inventory-approval/inventory-approval.component";

const routes: Routes = [
  {
    path: "inventory",
    component: InventoryApprovalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
