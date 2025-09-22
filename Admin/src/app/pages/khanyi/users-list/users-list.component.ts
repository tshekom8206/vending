import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from 'src/app/core/models/user.interface';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedRole: UserRole | 'all' = 'all';
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    const params: any = {};
    if (this.selectedRole !== 'all') {
      params.role = this.selectedRole;
    }
    if (this.selectedStatus !== 'all') {
      params.isActive = this.selectedStatus === 'active';
    }
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  filteredUsers(): User[] {
    if (!this.searchTerm) {
      return this.users;
    }
    return this.users.filter(user =>
      user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.phone.includes(this.searchTerm)
    );
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  navigateToAddUser(): void {
    this.router.navigate(['/khanyi/users/create']);
  }

  editUser(user: User): void {
    this.router.navigate(['/khanyi/users/edit', user.id]);
  }

  viewUser(user: User): void {
    this.router.navigate(['/khanyi/users/view', user.id]);
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${user.firstName} ${user.lastName}"?`)) {
      const serviceCall = user.isActive
        ? this.userService.deactivateUser(user.id, 'Admin action')
        : this.userService.activateUser(user.id);

      serviceCall.subscribe({
        next: () => {
          this.loadUsers(); // Reload the list
        },
        error: (error) => {
          this.error = `Failed to ${action} user. Please try again.`;
          console.error(`Error ${action}ing user:`, error);
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers(); // Reload the list
        },
        error: (error) => {
          this.error = 'Failed to delete user. Please try again.';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'system_admin': return 'System Admin';
      case 'estate_admin': return 'Estate Admin';
      case 'tenant': return 'Tenant';
      default: return role;
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case 'system_admin': return 'badge bg-danger';
      case 'estate_admin': return 'badge bg-warning';
      case 'tenant': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  getVerificationClass(isVerified: boolean): string {
    return isVerified ? 'text-success' : 'text-warning';
  }
}
