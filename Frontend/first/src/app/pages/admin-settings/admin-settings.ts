import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css'
})
export class AdminSettingsComponent implements OnInit {
  menuService = inject(MenuService);
  
  menuItems: any[] = [];
  availableRoles = ['admin', 'customer', 'shopkeeper', 'delivery', 'chef'];

  ngOnInit() {
    // Deep copy bana rahe hain taaki save karne se pehle changes apply na ho jayein
    this.menuService.currentMenu$.subscribe(menu => {
      this.menuItems = JSON.parse(JSON.stringify(menu));
    });
  }

  // Checkbox click hone par role add ya remove karna
  toggleRole(item: any, role: string) {
    const index = item.roles.indexOf(role);
    if (index > -1) {
      item.roles.splice(index, 1); // Agar already tick tha, toh hata do
    } else {
      item.roles.push(role); // Agar tick nahi tha, toh add kar do
    }
  }

  // Final save button
  saveSettings() {
    this.menuService.updateMenu(this.menuItems);
    alert('Menu Configuration Updated Successfully!');
  }
}