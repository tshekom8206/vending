import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { EstatesListComponent } from './estates-list/estates-list.component';
import { EstateFormComponent } from './estate-form/estate-form.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UnitsListComponent } from './units-list/units-list.component';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { AssignTenantComponent } from './assign-tenant/assign-tenant.component';
// import { PurchasesListComponent } from './purchases-list/purchases-list.component';

const routes: Routes = [
  {
    path: 'estates',
    component: EstatesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'estates/create',
    component: EstateFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin'] }
  },
  {
    path: 'estates/edit/:id',
    component: EstateFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin'] }
  },
  {
    path: 'estates/:id/units',
    component: UnitsListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin', 'estate_admin'] }
  },
  {
    path: 'estates/:estateId/units/create',
    component: UnitFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin', 'estate_admin'] }
  },
  {
    path: 'estates/:estateId/units/edit/:unitId',
    component: UnitFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin', 'estate_admin'] }
  },
  {
    path: 'estates/:estateId/units/:unitId/assign-tenant',
    component: AssignTenantComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin', 'estate_admin'] }
  },
  {
    path: 'users',
    component: UsersListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['system_admin'] }
  },
  // {
  //   path: 'purchases',
  //   component: PurchasesListComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KhanyiRoutingModule { }
