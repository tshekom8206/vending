import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Estate } from 'src/app/core/models/estate.interface';
import { EstateService } from 'src/app/core/services/estate.service';
import { KhanyiAuthService } from 'src/app/core/services/khanyi-auth.service';

@Component({
  selector: 'app-estates-list',
  templateUrl: './estates-list.component.html',
  styleUrls: ['./estates-list.component.scss']
})
export class EstatesListComponent implements OnInit {
  estates: Estate[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  constructor(
    private estateService: EstateService,
    private router: Router,
    private authService: KhanyiAuthService
  ) { }

  ngOnInit(): void {
    this.loadEstates();
  }

  loadEstates(): void {
    this.loading = true;
    this.error = '';

    this.estateService.getEstates().subscribe({
      next: (response: any) => {
        console.log('Estates API response:', response);
        // Handle the full response structure
        if (response && response.data) {
          this.estates = response.data;
        } else if (Array.isArray(response)) {
          this.estates = response;
        } else {
          this.estates = [];
        }
        this.loading = false;
        console.log('Estates loaded:', this.estates.length);
      },
      error: (error) => {
        this.error = 'Failed to load estates. Please try again.';
        this.loading = false;
        console.error('Error loading estates:', error);
      }
    });
  }

  filteredEstates(): Estate[] {
    if (!this.searchTerm) {
      return this.estates;
    }
    return this.estates.filter(estate =>
      estate.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      estate.address.city.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  navigateToAddEstate(): void {
    this.router.navigate(['/khanyi/estates/create']);
  }

  editEstate(estate: Estate): void {
    this.router.navigate(['/khanyi/estates/edit', estate.id]);
  }

  manageUnits(estate: Estate): void {
    this.router.navigate(['/khanyi/estates', estate.id, 'units']);
  }

  deleteEstate(estate: Estate): void {
    if (confirm(`Are you sure you want to delete "${estate.name}"?`)) {
      this.estateService.deleteEstate(estate.id).subscribe({
        next: () => {
          this.loadEstates(); // Reload the list
        },
        error: (error) => {
          this.error = 'Failed to delete estate. Please try again.';
          console.error('Error deleting estate:', error);
        }
      });
    }
  }

  getOccupancyRate(estate: Estate): number {
    if (estate.totalUnits === 0) return 0;
    return Math.round((estate.occupiedUnits / estate.totalUnits) * 100);
  }

  getOccupancyClass(rate: number): string {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-danger';
  }

  /**
   * Check if current user can create estates
   */
  canCreateEstate(): boolean {
    const currentUser = this.authService.currentUser;
    const hasRole = this.authService.hasRole('system_admin');
    return hasRole;
  }

  /**
   * Check if current user can edit estates
   */
  canEditEstate(): boolean {
    return this.authService.hasRole('system_admin');
  }

  /**
   * Check if current user can delete estates
   */
  canDeleteEstate(): boolean {
    return this.authService.hasRole('system_admin');
  }
}
