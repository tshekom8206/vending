import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstateService } from 'src/app/core/services/estate.service';
import { Estate, EstateCreateRequest, EstateUpdateRequest, EstateType } from 'src/app/core/models/estate.interface';

@Component({
  selector: 'app-estate-form',
  templateUrl: './estate-form.component.html',
  styleUrls: ['./estate-form.component.scss']
})
export class EstateFormComponent implements OnInit {
  estateForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  error = '';
  estateId: string | null = null;

  estateTypes: EstateType[] = ['Residential', 'Student Housing', 'Mixed Use'];
  availableAmenities = [
    'Swimming Pool', 'Gym', 'Playground', 'Security', 'Garden',
    'Parking', 'Shopping Center', 'Community Hall', 'Sports Court',
    'Laundry', 'Wi-Fi', 'Backup Power', 'Water Tank'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private estateService: EstateService
  ) {
    this.estateForm = this.createForm();
  }

  ngOnInit(): void {
    this.estateId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.estateId;

    if (this.isEditMode && this.estateId) {
      this.loadEstate(this.estateId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      type: ['Residential', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        suburb: [''],
        city: ['', Validators.required],
        province: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        country: ['South Africa', Validators.required]
      }),
      coordinates: this.fb.group({
        latitude: [null, [Validators.min(-90), Validators.max(90)]],
        longitude: [null, [Validators.min(-180), Validators.max(180)]]
      }),
      tariff: this.fb.group({
        rate: [0, [Validators.required, Validators.min(0)]],
        currency: ['ZAR', Validators.required],
        unit: ['kWh', Validators.required]
      }),
      amenities: [[]],
      isActive: [true]
    });
  }

  private loadEstate(id: string): void {
    this.loading = true;
    this.error = '';

    this.estateService.getEstateById(id).subscribe({
      next: (estate) => {
        this.populateForm(estate);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load estate details. Please try again.';
        this.loading = false;
        console.error('Error loading estate:', error);
      }
    });
  }

  private populateForm(estate: Estate): void {
    this.estateForm.patchValue({
      name: estate.name,
      description: estate.description || '',
      type: estate.type,
      address: {
        street: estate.address.street,
        suburb: estate.address.suburb || '',
        city: estate.address.city,
        province: estate.address.province,
        postalCode: estate.address.postalCode,
        country: estate.address.country
      },
      coordinates: {
        latitude: estate.coordinates?.latitude || null,
        longitude: estate.coordinates?.longitude || null
      },
      tariff: {
        rate: estate.tariff.rate,
        currency: estate.tariff.currency,
        unit: estate.tariff.unit
      },
      amenities: estate.amenities || [],
      isActive: estate.isActive
    });
  }

  onAmenityToggle(amenity: string): void {
    const amenities = this.estateForm.get('amenities')?.value || [];
    const index = amenities.indexOf(amenity);

    if (index > -1) {
      amenities.splice(index, 1);
    } else {
      amenities.push(amenity);
    }

    this.estateForm.patchValue({ amenities });
  }

  isAmenitySelected(amenity: string): boolean {
    const amenities = this.estateForm.get('amenities')?.value || [];
    return amenities.includes(amenity);
  }

  onSubmit(): void {
    if (this.estateForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const formValue = this.estateForm.value;

    if (this.isEditMode && this.estateId) {
      this.updateEstate(this.estateId, formValue);
    } else {
      this.createEstate(formValue);
    }
  }

  private createEstate(formValue: any): void {
    // Clean up optional fields to avoid sending empty strings
    const cleanAddress = {
      street: formValue.address.street,
      city: formValue.address.city,
      province: formValue.address.province,
      postalCode: formValue.address.postalCode,
      country: formValue.address.country,
      ...(formValue.address.suburb && formValue.address.suburb.trim() && {
        suburb: formValue.address.suburb.trim()
      })
    };

    const createRequest: EstateCreateRequest = {
      name: formValue.name,
      type: formValue.type,
      address: cleanAddress,
      coordinates: formValue.coordinates.latitude && formValue.coordinates.longitude
        ? formValue.coordinates
        : undefined,
      tariff: formValue.tariff,
      amenities: formValue.amenities
    };

    // Only include description if it's not empty
    if (formValue.description && formValue.description.trim()) {
      createRequest.description = formValue.description.trim();
    }

    this.estateService.createEstate(createRequest).subscribe({
      next: (estate) => {
        console.log('Estate created successfully:', estate);
        this.router.navigate(['/khanyi/estates']);
      },
      error: (error) => {
        this.error = 'Failed to create estate. Please try again.';
        this.saving = false;
        console.error('Error creating estate:', error);
      }
    });
  }

  private updateEstate(id: string, formValue: any): void {
    // Clean up optional fields to avoid sending empty strings
    const cleanAddress = {
      street: formValue.address.street,
      city: formValue.address.city,
      province: formValue.address.province,
      postalCode: formValue.address.postalCode,
      country: formValue.address.country,
      ...(formValue.address.suburb && formValue.address.suburb.trim() && {
        suburb: formValue.address.suburb.trim()
      })
    };

    const updateRequest: EstateUpdateRequest = {
      name: formValue.name,
      type: formValue.type,
      address: cleanAddress,
      coordinates: formValue.coordinates.latitude && formValue.coordinates.longitude
        ? formValue.coordinates
        : undefined,
      tariff: formValue.tariff,
      amenities: formValue.amenities,
      isActive: formValue.isActive
    };

    // Only include description if it's not empty
    if (formValue.description && formValue.description.trim()) {
      updateRequest.description = formValue.description.trim();
    }

    this.estateService.updateEstate(id, updateRequest).subscribe({
      next: (estate) => {
        console.log('Estate updated successfully:', estate);
        this.router.navigate(['/khanyi/estates']);
      },
      error: (error) => {
        this.error = 'Failed to update estate. Please try again.';
        this.saving = false;
        console.error('Error updating estate:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.estateForm.controls).forEach(key => {
      const control = this.estateForm.get(key);
      control?.markAsTouched();

      if (control?.hasError && typeof control.hasError === 'function') {
        // Handle nested form groups
        if (key === 'address' || key === 'coordinates' || key === 'tariff') {
          Object.keys((control as FormGroup).controls).forEach(nestedKey => {
            (control as FormGroup).get(nestedKey)?.markAsTouched();
          });
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/khanyi/estates']);
  }

  getFieldError(fieldName: string): string {
    const field = this.estateForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be less than ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  getNestedFieldError(groupName: string, fieldName: string): string {
    const field = this.estateForm.get(`${groupName}.${fieldName}`);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be less than ${field.errors['max'].max}`;
      if (field.errors['pattern']) {
        if (fieldName === 'postalCode') return 'Postal code must be exactly 4 digits';
        return `${fieldName} format is invalid`;
      }
    }
    return '';
  }
}
