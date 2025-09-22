import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Unit, UnitCreateRequest, UnitUpdateRequest } from 'src/app/core/models/unit.interface';
import { Estate } from 'src/app/core/models/estate.interface';
import { UnitService } from 'src/app/core/services/unit.service';
import { EstateService } from 'src/app/core/services/estate.service';

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.scss']
})
export class UnitFormComponent implements OnInit {
  unitForm!: FormGroup;
  estate: Estate | null = null;
  unit: Unit | null = null;
  estateId = '';
  unitId = '';
  isEditMode = false;
  loading = false;
  saving = false;
  error = '';

  // Options for dropdowns
  unitStatuses = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
  amenityOptions = [
    'Air Conditioning',
    'Heating',
    'Built-in Wardrobes',
    'Dishwasher',
    'Washing Machine Connection',
    'Study Nook',
    'Fireplace',
    'Solar Geyser',
    'Fiber Internet Ready'
  ];
  chargeFrequencies = ['Monthly', 'Quarterly', 'Annually', 'Once-off'];

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private estateService: EstateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.estateId = params['estateId'];
      this.unitId = params['unitId'];
      this.isEditMode = !!this.unitId;

      if (this.estateId) {
        this.loadEstate();
      }

      if (this.isEditMode && this.unitId) {
        this.loadUnit();
      }
    });
  }

  initializeForm(): void {
    this.unitForm = this.fb.group({
      unitNumber: ['', [Validators.required, Validators.maxLength(20)]],
      status: ['Available'],
      specifications: this.fb.group({
        bedrooms: [0, [Validators.min(0), Validators.max(10)]],
        bathrooms: [0, [Validators.min(0), Validators.max(10)]],
        area: this.fb.group({
          size: [0, [Validators.min(0)]],
          unit: ['m²']
        }),
        floor: [0],
        hasBalcony: [false],
        hasGarden: [false],
        parking: this.fb.group({
          spaces: [0, [Validators.min(0)]],
          covered: [false]
        })
      }),
      charges: this.fb.group({
        monthlyRent: [0, [Validators.min(0)]],
        deposit: [0, [Validators.min(0)]],
        additionalCharges: this.fb.array([])
      }),
      amenities: this.fb.array([]),
      isActive: [true]
    });
  }

  get additionalCharges(): FormArray {
    return this.unitForm.get('charges.additionalCharges') as FormArray;
  }

  get amenities(): FormArray {
    return this.unitForm.get('amenities') as FormArray;
  }

  loadEstate(): void {
    this.estateService.getEstateById(this.estateId).subscribe({
      next: (estate: Estate) => {
        this.estate = estate;
        console.log('Estate loaded:', estate);
      },
      error: (error) => {
        this.error = 'Failed to load estate details. Please try again.';
        console.error('Error loading estate:', error);
      }
    });
  }

  loadUnit(): void {
    this.loading = true;
    this.error = '';

    this.unitService.getUnitById(this.unitId).subscribe({
      next: (unit: Unit) => {
        this.unit = unit;
        this.populateForm(unit);
        this.loading = false;
        console.log('Unit loaded:', unit);
      },
      error: (error) => {
        this.error = 'Failed to load unit details. Please try again.';
        this.loading = false;
        console.error('Error loading unit:', error);
      }
    });
  }

  populateForm(unit: Unit): void {
    this.unitForm.patchValue({
      unitNumber: unit.unitNumber,
      status: unit.status,
      specifications: {
        bedrooms: unit.specifications?.bedrooms || 0,
        bathrooms: unit.specifications?.bathrooms || 0,
        area: {
          size: unit.specifications?.area?.size || 0,
          unit: unit.specifications?.area?.unit || 'm²'
        },
        floor: unit.specifications?.floor || 0,
        hasBalcony: unit.specifications?.hasBalcony || false,
        hasGarden: unit.specifications?.hasGarden || false,
        parking: {
          spaces: unit.specifications?.parking?.spaces || 0,
          covered: unit.specifications?.parking?.covered || false
        }
      },
      charges: {
        monthlyRent: unit.charges?.monthlyRent || 0,
        deposit: unit.charges?.deposit || 0
      },
      isActive: unit.isActive
    });

    // Populate additional charges
    if (unit.charges?.additionalCharges) {
      unit.charges.additionalCharges.forEach(charge => {
        this.addAdditionalCharge(charge);
      });
    }

    // Populate amenities
    if (unit.amenities) {
      unit.amenities.forEach(amenity => {
        this.amenities.push(this.fb.control(amenity));
      });
    }
  }

  addAdditionalCharge(charge?: any): void {
    const chargeGroup = this.fb.group({
      description: [charge?.description || '', Validators.required],
      amount: [charge?.amount || 0, [Validators.required, Validators.min(0)]],
      frequency: [charge?.frequency || 'Monthly', Validators.required]
    });

    this.additionalCharges.push(chargeGroup);
  }

  removeAdditionalCharge(index: number): void {
    this.additionalCharges.removeAt(index);
  }

  onAmenityChange(amenity: string, checked: boolean): void {
    if (checked) {
      this.amenities.push(this.fb.control(amenity));
    } else {
      const index = this.amenities.controls.findIndex(control => control.value === amenity);
      if (index >= 0) {
        this.amenities.removeAt(index);
      }
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.amenities.controls.some(control => control.value === amenity);
  }

  onSubmit(): void {
    if (this.unitForm.valid) {
      this.saving = true;
      this.error = '';

      const formValue = this.unitForm.value;
      const unitData = {
        unitNumber: formValue.unitNumber,
        estate: this.estateId,
        specifications: formValue.specifications,
        charges: {
          monthlyRent: formValue.charges.monthlyRent,
          deposit: formValue.charges.deposit,
          additionalCharges: formValue.charges.additionalCharges
        },
        amenities: formValue.amenities,
        isActive: formValue.isActive
      };

      if (this.isEditMode) {
        // Update existing unit
        const updateData: UnitUpdateRequest = {
          ...unitData,
          status: formValue.status
        };

        this.unitService.updateUnit(this.unitId, updateData).subscribe({
          next: (response) => {
            console.log('Unit updated successfully:', response);
            this.saving = false;
            this.router.navigate(['/khanyi/estates', this.estateId, 'units']);
          },
          error: (error) => {
            this.error = 'Failed to update unit. Please try again.';
            this.saving = false;
            console.error('Error updating unit:', error);
          }
        });
      } else {
        // Create new unit
        const createData: UnitCreateRequest = unitData;

        this.unitService.createUnit(createData).subscribe({
          next: (response) => {
            console.log('Unit created successfully:', response);
            this.saving = false;
            this.router.navigate(['/khanyi/estates', this.estateId, 'units']);
          },
          error: (error) => {
            this.error = 'Failed to create unit. Please try again.';
            this.saving = false;
            console.error('Error creating unit:', error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.unitForm);
      this.error = 'Please fix the validation errors and try again.';
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units']);
  }

  getFieldError(fieldName: string): string {
    const field = this.unitForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;
      if (errors['required']) return 'This field is required';
      if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
      if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  getNestedFieldError(groupName: string, fieldName: string): string {
    const field = this.unitForm.get(`${groupName}.${fieldName}`);
    if (field?.errors && field.touched) {
      const errors = field.errors;
      if (errors['required']) return 'This field is required';
      if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
      if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }
}