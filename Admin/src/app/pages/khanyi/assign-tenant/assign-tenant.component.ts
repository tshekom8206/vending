import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../../core/services/unit.service';
import { UserService } from '../../../core/services/user.service';
import { Unit } from '../../../core/models/unit.interface';
import { User } from '../../../core/models/user.interface';

@Component({
  selector: 'app-assign-tenant',
  templateUrl: './assign-tenant.component.html',
  styleUrls: ['./assign-tenant.component.scss']
})
export class AssignTenantComponent implements OnInit {
  assignForm!: FormGroup;
  unit: Unit | null = null;
  availableTenants: User[] = [];
  loading = false;
  error: string | null = null;
  estateId!: string;
  unitId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService,
    private userService: UserService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.estateId = this.route.snapshot.paramMap.get('estateId')!;
    this.unitId = this.route.snapshot.paramMap.get('unitId')!;

    this.loadUnit();
    this.loadAvailableTenants();
  }

  private initForm(): void {
    this.assignForm = this.fb.group({
      tenantId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      monthlyRent: [0, [Validators.required, Validators.min(0)]],
      deposit: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  private loadUnit(): void {
    this.unitService.getUnitById(this.unitId).subscribe({
      next: (unit: Unit) => {
        this.unit = unit;
        // Pre-fill rent from unit charges if available
        if (unit.charges?.monthlyRent) {
          this.assignForm.patchValue({
            monthlyRent: unit.charges.monthlyRent,
            deposit: unit.charges.deposit || 0
          });
        }
      },
      error: (error: any) => {
        this.error = 'Failed to load unit details.';
        console.error('Error loading unit:', error);
      }
    });
  }

  private loadAvailableTenants(): void {
    this.userService.getUsers({ role: 'tenant' }).subscribe({
      next: (response) => {
        this.availableTenants = response.data || [];
      },
      error: (error: any) => {
        this.error = 'Failed to load available tenants.';
        console.error('Error loading tenants:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.valid && this.unit) {
      this.loading = true;
      this.error = null;

      const formValue = this.assignForm.value;
      const tenantData = {
        tenantId: formValue.tenantId,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        monthlyRent: formValue.monthlyRent,
        deposit: formValue.deposit
      };

      this.unitService.assignTenant(this.unitId, tenantData).subscribe({
        next: () => {
          this.router.navigate(['/khanyi/estates', this.estateId, 'units']);
        },
        error: (error: any) => {
          this.loading = false;
          this.error = 'Failed to assign tenant. Please try again.';
          console.error('Error assigning tenant:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.assignForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors?.['min']) {
        return `${this.getFieldLabel(fieldName)} must be greater than or equal to ${field.errors['min'].min}`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tenantId: 'Tenant',
      startDate: 'Start Date',
      endDate: 'End Date',
      monthlyRent: 'Monthly Rent',
      deposit: 'Deposit'
    };
    return labels[fieldName] || fieldName;
  }

  getEstateName(): string {
    if (this.unit?.estate && typeof this.unit.estate === 'object') {
      return this.unit.estate.name;
    }
    return 'Units';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available': return 'bg-success-subtle text-success';
      case 'Occupied': return 'bg-info-subtle text-info';
      case 'Maintenance': return 'bg-warning-subtle text-warning';
      case 'Reserved': return 'bg-secondary-subtle text-secondary';
      default: return 'bg-light text-dark';
    }
  }
}