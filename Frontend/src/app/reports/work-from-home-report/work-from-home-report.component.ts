import { Component, OnInit } from '@angular/core';
import { EmployeesService } from 'src/app/Services/Employees-serives/employees.service';

@Component({
  selector: 'app-work-from-home-report',
  templateUrl: './work-from-home-report.component.html',
  styleUrls: ['./work-from-home-report.component.scss']
})
export class WorkFromHomeReportComponent implements OnInit {
    backendUrl = 'http://localhost:3000';

  employees: any[] = [];
  filteredEmployees: any[] = [];

  filter = {
    from: '',
    to: ''
  };

  searchText: string = '';

  constructor(private employeeService: EmployeesService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = [...data];
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  applyFilters(): void {
    const fromDate = this.filter.from ? new Date(this.filter.from) : null;
    const toDate = this.filter.to ? new Date(this.filter.to) : null;

    let filtered = this.employees.filter(emp => {
      const joinDate = new Date(emp.joiningDate);
      return (!fromDate || joinDate >= fromDate) &&
             (!toDate || joinDate <= toDate);
    });

    this.filteredEmployees = this.applySearchToList(filtered);
  }

  applySearch(): void {
    this.filteredEmployees = this.applySearchToList(this.filteredEmployees);
  }

  private applySearchToList(list: any[]): any[] {
    if (!this.searchText.trim()) return list;

    const searchLower = this.searchText.toLowerCase();
    return list.filter(emp =>
      (emp.firstname + ' ' + emp.lastName).toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.phone?.toLowerCase().includes(searchLower)
    );
  }

  trackById(index: number, emp: any): number {
    return emp.id;
  }

  exportToCSV(): void {
    if (this.filteredEmployees.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Work From Home Days'];
    const rows = this.filteredEmployees.map(emp => [
      `${emp.firstname} ${emp.lastName}`,
      emp.email,
      emp.phone || 'N/A',
      emp.workFromHomeDays || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'work-from-home-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

    getEmployeeImage(emp: any): string {
  return emp.image ? `${this.backendUrl}${emp.image}` : 'assets/default-user.png';
}

onImageError(event: any) {
  event.target.src = 'assets/default-user.png';
}
}