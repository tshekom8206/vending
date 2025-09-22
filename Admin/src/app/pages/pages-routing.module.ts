import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Dashboard Routes
  {
    path: '', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },
  {
    path: 'dashboard', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },

  // Khanyi Custom Routes
  {
    path: 'khanyi', loadChildren: () => import('./khanyi/khanyi.module').then(m => m.KhanyiModule)
  },

  // Estate Management Routes
  {
    path: 'estates', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },
  {
    path: 'units', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },
  {
    path: 'meters', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },

  // Transaction Routes
  {
    path: 'purchases', loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule)
  },
  {
    path: 'tokens', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },

  // User Management Routes
  {
    path: 'users', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },

  // Communication Routes
  {
    path: 'notifications', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },

  // Legacy Routes (keep for existing functionality)
  {
    path: 'apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
  },
  {
    path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UiModule)
  },
  {
    path: 'invoices', loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule)
  },
  {
    path: 'advance-ui', loadChildren: () => import('./advance-ui/advance-ui.module').then(m => m.AdvanceUiModule)
  },
  {
    path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule)
  },
  {
    path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule)
  },
  {
    path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule)
  },
  {
    path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
  },
  {
    path: 'forms', loadChildren: () => import('./forms/forms.module').then(m => m.FormModule)
  },
  {
    path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
