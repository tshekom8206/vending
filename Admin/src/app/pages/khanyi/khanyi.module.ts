import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { KhanyiRoutingModule } from './khanyi-routing.module';
import { EstatesListComponent } from './estates-list/estates-list.component';
import { EstateFormComponent } from './estate-form/estate-form.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UnitsListComponent } from './units-list/units-list.component';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { AssignTenantComponent } from './assign-tenant/assign-tenant.component';
// import { PurchasesListComponent } from './purchases-list/purchases-list.component';

@NgModule({
  declarations: [
    EstatesListComponent,
    EstateFormComponent,
    UsersListComponent,
    UnitsListComponent,
    UnitFormComponent,
    AssignTenantComponent
    // PurchasesListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    KhanyiRoutingModule
  ]
})
export class KhanyiModule { }
