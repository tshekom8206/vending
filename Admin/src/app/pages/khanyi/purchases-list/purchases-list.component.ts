import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Purchase } from 'src/app/core/models/purchase.interface';
import { PurchaseService } from 'src/app/core/services/purchase.service';

@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchases-list.component.html',
  styleUrls: ['./purchases-list.component.scss']
})
export class PurchasesListComponent implements OnInit {
  purchases: Purchase[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedStatus: 'all' | 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled' = 'all';
  selectedPeriod: 'today' | 'week' | 'month' | 'all' = 'all';

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = '';

    const params: any = {};
    if (this.selectedStatus !== 'all') {
      params.status = this.selectedStatus;
    }
    if (this.selectedPeriod !== 'all') {
      params.period = this.selectedPeriod;
    }
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.purchaseService.getPurchases(params).subscribe({
      next: (response) => {
        this.purchases = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load purchases. Please try again.';
        this.loading = false;
        console.error('Error loading purchases:', error);
      }
    });
  }

  filteredPurchases(): Purchase[] {
    if (!this.searchTerm) {
      return this.purchases;
    }
    return this.purchases.filter(purchase =>
      purchase.user?.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      purchase.unit?.estate?.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      purchase.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      purchase.amount.toString().includes(this.searchTerm)
    );
  }

  onFilterChange(): void {
    this.loadPurchases();
  }

  viewPurchase(purchase: Purchase): void {
    this.router.navigate(['/khanyi/purchases/view', purchase.id]);
  }

  refundPurchase(purchase: Purchase): void {
    if (purchase.status !== 'Completed') {
      alert('Only completed purchases can be refunded.');
      return;
    }

    const reason = prompt('Please enter a reason for the refund:');
    if (reason && confirm(`Are you sure you want to refund this purchase of ZAR ${purchase.amount}?`)) {
      // Note: This would need a refund method in the service
      alert('Refund functionality would be implemented here');
    }
  }

  downloadReceipt(purchase: Purchase): void {
    if (purchase.status === 'Completed') {
      // Note: This would need a download receipt method in the service
      alert('Download receipt functionality would be implemented here');
    } else {
      alert('Receipt is only available for completed purchases.');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'badge bg-success';
      case 'Pending': return 'badge bg-warning';
      case 'Failed': return 'badge bg-danger';
      case 'Refunded': return 'badge bg-secondary';
      case 'Cancelled': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  getStatusDisplayName(status: string): string {
    return status; // Already properly capitalized
  }

  formatCurrency(amount: number): string {
    return `ZAR ${amount.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString();
  }

  calculateTotalRevenue(): number {
    return this.purchases
      .filter(p => p.status === 'Completed')
      .reduce((total, p) => total + p.amount, 0);
  }

  getCompletedPurchasesCount(): number {
    return this.purchases.filter(p => p.status === 'Completed').length;
  }

  getPendingPurchasesCount(): number {
    return this.purchases.filter(p => p.status === 'Pending').length;
  }

  getFailedPurchasesCount(): number {
    return this.purchases.filter(p => p.status === 'Failed').length;
  }
}
