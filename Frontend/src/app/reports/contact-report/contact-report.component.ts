import { Component, OnInit } from '@angular/core';
import { EmployeesService } from 'src/app/Services/Employees-serives/employees.service';

@Component({
  selector: 'app-contact-report',
  templateUrl: './contact-report.component.html',
  styleUrls: ['./contact-report.component.scss']
})
export class ContactReportComponent implements OnInit {
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

    // Filter by joining date first
    let filtered = this.employees.filter(emp => {
      const joinDate = new Date(emp.joiningDate);
      return (!fromDate || joinDate >= fromDate) &&
             (!toDate || joinDate <= toDate);
    });

    // Apply search on the filtered list
    this.filteredEmployees = this.applySearchToList(filtered);
  }

  applySearch(): void {
    // Apply search on the current filteredEmployees
    this.filteredEmployees = this.applySearchToList(this.filteredEmployees);
  }

  private applySearchToList(list: any[]): any[] {
    const text = this.searchText.trim().toLowerCase();
    if (!text) return list;
    return list.filter(emp =>
      emp.firstname.toLowerCase().includes(text) ||
      emp.lastName.toLowerCase().includes(text) ||
      emp.email.toLowerCase().includes(text)
    );
  }

  trackById(index: number, emp: any): number {
    return emp.id;
  }

  exportToCSV(): void {
    if (!this.filteredEmployees.length) return;

    const headers = ['Name', 'Email', 'Secondary Email', 'Phone', 'Secondary Phone'];
    const rows = this.filteredEmployees.map(emp => [
      emp.firstname + ' ' + emp.lastName,
      emp.email,
      emp.secondaryEmail || 'N/A',
      emp.phone || 'N/A',
      emp.secondaryPhone || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'contact-report.csv');
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