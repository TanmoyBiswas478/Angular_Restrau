import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryService, DeliveryOrder } from '../../services/delivery';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css'
})
export class DeliveriesComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private cdr = inject(ChangeDetectorRef);

  orders: DeliveryOrder[] = [];
  isLoading = false;

  ngOnInit() {
    this.fetchDeliveries();
  }

  fetchDeliveries() {
  this.isLoading = true;
  this.deliveryService.getDeliveries().subscribe({
    next: (data) => {
      this.orders = data.map((item: any) => ({
        id: item.id, // Put request ke liye internal ID
        

        // 🎯 STRICTLY API SE AANE WALA CUSTOMER ID DATA (CID1, CID2...)
        customerId: item.customer_id || item.cid,

        // 🎯 STRICTLY API SE AANE WALA ORDER NUMBER
        orderNumber: item.order_number || item.orderNumber,

        customerName: item.customer_name || item.customerName || 'Customer',
        address: item.delivery_address || item.address || 'Standard Location',
        items: item.items || 'Standard Order Package',
        total: item.total || item.amount || item.total_amount || 0,
        status: item.status || 'Order Placed'
      }));
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error fetching deliveries from DB:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  updateStatus(order: DeliveryOrder, newStatus: 'Preparing' | 'Out for Delivery' | 'Delivered') {
    if (!order.id) return;

    const previousStatus = order.status;
    order.status = newStatus;
    this.cdr.detectChanges();

    this.deliveryService.updateStatus(order.id, newStatus).subscribe({
      error: (err) => {
        console.error('Failed to update status in DB:', err);
        order.status = previousStatus;
        this.cdr.detectChanges();
      }
    });
  }
}