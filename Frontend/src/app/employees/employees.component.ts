import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  allEmployees: Employee[] = []; // master copy for filters
  loading = false;
  error: string | null = null;
  selectedEmployeeIdForDelete?: number;

  // Sorting
  selectedSort: string = 'Newest';
  sortDropdownOpen: boolean = false; 

  // Filters
  filters = {
    name: '',
    status: ''
  };

  private routerSub?: Subscription;

  constructor(
    private employeesService: EmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();

    // Reload employees on navigation back to /employees
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        if (navEnd.urlAfterRedirects.startsWith('/employees')) {
          this.loadEmployees();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  // Load employees from API
  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.allEmployees = [...data];
        this.employees = [...data];
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      }
    });
  }

  // Delete functions
  confirmDelete(id: number): void {
    this.selectedEmployeeIdForDelete = id;
  }

  deleteEmployee(): void {
    if (!this.selectedEmployeeIdForDelete) return;

    this.employeesService.deleteEmployee(this.selectedEmployeeIdForDelete).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.id !== this.selectedEmployeeIdForDelete);
        this.selectedEmployeeIdForDelete = undefined;
      },
      error: (err) => {
        alert('Error deleting employee: ' + (err.message || 'Unknown error'));
        console.error('Delete failed:', err);
      }
    });
  }

  // Edit employee
  editEmployee(id: number): void {
    this.router.navigate(['/add-employee', id]);
  }

  trackById(index: number, employee: Employee): number {
    return employee.id ?? index;
  }

  // Update status
  onStatusChange(emp: Employee): void {
    this.employeesService.updateEmployeeStatus(emp.id!, emp.status).subscribe({
      next: () => {
        console.log(`Status updated for employee ${emp.id} to ${emp.status}`);
      },
      error: (err) => {
        alert('Failed to update status: ' + (err.message || 'Unknown error'));
        console.error('Status update error:', err);
        this.loadEmployees();
      }
    });
  }

  // Sort dropdown toggle
  toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  // Sort employees
  sortBy(option: string) {
    this.selectedSort = option;
    this.sortDropdownOpen = false;

    let sorted = [...this.allEmployees];

    switch(option) {
      case 'Newest':
        sorted.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
        break;
      case 'Oldest':
        sorted.sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime());
        break;
      case 'Descending':
        sorted.sort((a, b) => b.salary - a.salary);
        break;
      case 'Last Month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        sorted = sorted.filter(emp => new Date(emp.joiningDate) >= lastMonth);
        break;
      case 'Last 7 Days':
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        sorted = sorted.filter(emp => new Date(emp.joiningDate) >= last7Days);
        break;
    }

    this.employees = sorted;
  }  

  // Apply filters
  applyFilters(): void {
    let filtered = [...this.allEmployees];

    // Filter by name (case insensitive)
    if (this.filters.name.trim()) {
      filtered = filtered.filter(emp =>
        emp.name?.toLowerCase().includes(this.filters.name.toLowerCase())
      );
    }

    // Filter by status
    if (this.filters.status) {
      filtered = filtered.filter(emp => emp.status === this.filters.status);
    }

    this.employees = filtered;
  }

  // Clear all filters
  clearFilters(): void {
    this.filters = { name: '', status: '' };
    this.employees = [...this.allEmployees];
  }

closeFilterDropdown(event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const toggleEl = document.getElementById('filterDropdownToggle');
  if (toggleEl) {
    const dropdown = (bootstrap as any).Dropdown.getInstance(toggleEl) 
                  || new (bootstrap as any).Dropdown(toggleEl);
    dropdown.hide();
  }
}

}
