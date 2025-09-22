import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Unit, UnitSearchRequest } from 'src/app/core/models/unit.interface';
import { Estate } from 'src/app/core/models/estate.interface';
import { UnitService } from 'src/app/core/services/unit.service';
import { EstateService } from 'src/app/core/services/estate.service';
import { KhanyiAuthService } from 'src/app/core/services/khanyi-auth.service';

@Component({
  selector: 'app-units-list',
  templateUrl: './units-list.component.html',
  styleUrls: ['./units-list.component.scss']
})
export class UnitsListComponent implements OnInit {
  units: Unit[] = [];
  estate: Estate | null = null;
  loading = false;
  error = '';
  searchTerm = '';
  estateId = '';

  // Filter options
  statusFilter = '';
  bedroomsFilter = '';
  bathroomsFilter = '';

  // Dropdown state
  openDropdownId: string | null = null;

  constructor(
    private unitService: UnitService,
    private estateService: EstateService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: KhanyiAuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.estateId = params['id'];
      if (this.estateId) {
        this.loadEstate();
        this.loadUnits();
      }
    });
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

  loadUnits(): void {
    this.loading = true;
    this.error = '';

    const searchParams: UnitSearchRequest = {};
    if (this.searchTerm) {
      searchParams.search = this.searchTerm;
    }
    if (this.statusFilter) {
      searchParams.status = this.statusFilter as any;
    }
    if (this.bedroomsFilter) {
      searchParams.bedrooms = parseInt(this.bedroomsFilter);
    }
    if (this.bathroomsFilter) {
      searchParams.bathrooms = parseInt(this.bathroomsFilter);
    }

    this.unitService.getUnitsByEstate(this.estateId, searchParams).subscribe({
      next: (response: Unit[]) => {
        console.log('Units API response:', response);
        this.units = response;
        this.loading = false;
        console.log('Units loaded:', this.units.length);
      },
      error: (error) => {
        this.error = 'Failed to load units. Please try again.';
        this.loading = false;
        console.error('Error loading units:', error);
      }
    });
  }

  filteredUnits(): Unit[] {
    if (!this.searchTerm && !this.statusFilter && !this.bedroomsFilter && !this.bathroomsFilter) {
      return this.units;
    }

    return this.units.filter(unit => {
      let matches = true;

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matches = matches && (
          unit.unitNumber.toLowerCase().includes(searchLower) ||
          (unit.tenant as any)?.firstName?.toLowerCase().includes(searchLower) ||
          (unit.tenant as any)?.lastName?.toLowerCase().includes(searchLower)
        );
      }

      if (this.statusFilter) {
        matches = matches && unit.status === this.statusFilter;
      }

      if (this.bedroomsFilter) {
        matches = matches && unit.specifications?.bedrooms === parseInt(this.bedroomsFilter);
      }

      if (this.bathroomsFilter) {
        matches = matches && unit.specifications?.bathrooms === parseInt(this.bathroomsFilter);
      }

      return matches;
    });
  }

  navigateToAddUnit(): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units', 'create']);
  }

  editUnit(unit: Unit): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units', 'edit', unit.id]);
  }

  viewUnit(unit: Unit): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units', 'detail', unit.id]);
  }

  assignTenant(unit: Unit): void {
    this.router.navigate(['/khanyi/estates', this.estateId, 'units', unit.id, 'assign-tenant']);
  }

  removeTenant(unit: Unit): void {
    if (confirm(`Are you sure you want to remove the tenant from unit "${unit.unitNumber}"?`)) {
      this.unitService.removeTenant(unit.id).subscribe({
        next: () => {
          this.loadUnits(); // Reload the list
        },
        error: (error) => {
          this.error = 'Failed to remove tenant. Please try again.';
          console.error('Error removing tenant:', error);
        }
      });
    }
  }

  deleteUnit(unit: Unit): void {
    if (confirm(`Are you sure you want to delete unit "${unit.unitNumber}"?`)) {
      this.unitService.deleteUnit(unit.id).subscribe({
        next: () => {
          this.loadUnits(); // Reload the list
        },
        error: (error) => {
          this.error = 'Failed to delete unit. Please try again.';
          console.error('Error deleting unit:', error);
        }
      });
    }
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

  getUnitDescription(unit: Unit): string {
    const specs = unit.specifications;
    if (!specs) return 'Unit';

    let desc = '';
    if (specs.bedrooms) desc += `${specs.bedrooms} bed`;
    if (specs.bathrooms) desc += `${desc ? ', ' : ''}${specs.bathrooms} bath`;
    if (specs.area?.size) desc += `${desc ? ', ' : ''}${specs.area.size}${specs.area.unit || 'm²'}`;

    return desc || 'Unit';
  }

  getTenantName(unit: Unit): string {
    if (unit.tenant && typeof unit.tenant === 'object') {
      const tenant = unit.tenant as any;
      return `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim();
    }
    return '';
  }

  getRentAmount(unit: Unit): number {
    return unit.lease?.monthlyRent || unit.charges?.monthlyRent || 0;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.bedroomsFilter = '';
    this.bathroomsFilter = '';
    this.loadUnits();
  }

  /**
   * Check if current user can create units
   */
  canCreateUnit(): boolean {
    return this.authService.hasRole('system_admin') || this.authService.hasRole('estate_admin');
  }

  /**
   * Check if current user can edit units
   */
  canEditUnit(): boolean {
    return this.authService.hasRole('system_admin') || this.authService.hasRole('estate_admin');
  }

  /**
   * Check if current user can delete units
   */
  canDeleteUnit(): boolean {
    return this.authService.hasRole('system_admin');
  }

  /**
   * Check if current user can manage tenants
   */
  canManageTenants(): boolean {
    return this.authService.hasRole('system_admin') || this.authService.hasRole('estate_admin');
  }

  /**
   * Toggle dropdown menu for a specific unit
   */
  toggleDropdown(unitId: string, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === unitId ? null : unitId;
  }

  /**
   * Close dropdown when clicking outside
   */
  closeDropdown(): void {
    this.openDropdownId = null;
  }

  /**
   * Check if dropdown is open for a specific unit
   */
  isDropdownOpen(unitId: string): boolean {
    return this.openDropdownId === unitId;
  }
}