import { Component, OnInit } from '@angular/core';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';

@Component({
  selector: 'app-employees-grid',
  templateUrl: './employees-grid.component.html',
  styleUrls: ['./employees-grid.component.scss']
})
export class EmployeesGridComponent implements OnInit {

  allEmployees: Employee[] = [];   // all employees from backend
  employees: Employee[] = [];      // employees displayed after sorting/filter
  selectedSort: string = 'Newest';
  sortDropdownOpen: boolean = false; 
  searchText: string = '';         // for search input

  constructor(private employeesService: EmployeesService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  // Load employees from backend
  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        // Ensure profileImage is full URL
        const backendBaseUrl = 'http://localhost:3000';
        this.allEmployees = data.map(emp => ({
          ...emp,
          profileImage: emp.image
            ? emp.image.startsWith('http')
              ? emp.image
              : `${backendBaseUrl}${emp.image}?t=${new Date().getTime()}`
            : null
        }));
        this.employees = [...this.allEmployees];
      },
      error: (err) => console.error('Failed to load employees:', err)
    });
  }

  // Toggle sort dropdown
  toggleSortDropdown(): void {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  // Sort employees
  sortBy(option: string): void {
    this.selectedSort = option;
    this.sortDropdownOpen = false; // close dropdown

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

  // Filter by search text
  get filteredEmployees(): Employee[] {
    if (!this.searchText) return this.employees;
    return this.employees.filter(emp =>
      (emp.firstname + ' ' + emp.lastName).toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Optional: Load more employees (if using pagination)
  loadMore(): void {
    // implement backend call if pagination exists
    console.log('Load more clicked');
  }

  // Get employee image with fallback and cache busting
  getEmployeeImage(emp: Employee): string {
    const backendBaseUrl = 'http://localhost:3000';
    if (emp.profileImage) {
      return emp.profileImage.startsWith('http')
        ? emp.profileImage
        : `${backendBaseUrl}${emp.profileImage}?t=${new Date().getTime()}`;
    }
    return 'assets/img/employees/default.jpg'; // fallback
  }

}
