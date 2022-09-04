import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGaurd } from './shared/services/auth.gaurd';
import { BlankLayoutComponent } from './shared/components/layouts/blank-layout/blank-layout.component';
import { AdminLayoutSidebarCompactComponent } from './shared/components/layouts/admin-layout-sidebar-compact/admin-layout-sidebar-compact.component';

const adminRoutes: Routes = [
  {
    path: "dashboard",
    loadChildren: () =>
      import("./views/dashboard/dashboard.module").then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: "invoice",
    loadChildren: () =>
      import("./views/invoice/invoice.module").then((m) => m.InvoiceModule),
  },
  {
    path: "inventory",
    loadChildren: () =>
      import("./views/store/inventory.module").then((m) => m.InventoryModule),
  },
  {
    path: "brands",
    loadChildren: () =>
      import("./views/brands/brands.module").then((m) => m.BrandsModule),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./views/admin/admin.module").then((m) => m.AdminModule),
  },
  {
    path: "projects",
    loadChildren: () =>
      import("./views/project/project.module").then((m) => m.ProjectModule),
  },
  {
    path: "users",
    loadChildren: () =>
      import("./views/users/users.module").then((m) => m.UsersModule),
  }
];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule)
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'others',
        loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutSidebarCompactComponent,
    canActivate: [AuthGaurd],
    children: adminRoutes
  },
  {
    path: '**',
    redirectTo: 'others/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
