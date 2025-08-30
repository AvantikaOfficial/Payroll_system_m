import { Component, OnInit } from '@angular/core';
import { EmployeesService, Employee } from '../../Services/Employees-serives/employees.service';

@Component({
  selector: 'app-security-report',
  templateUrl: './security-report.component.html',
  styleUrls: ['./security-report.component.scss']
})
export class SecurityReportComponent implements OnInit {
  backendUrl = 'http://localhost:3000'; 
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchText: string = '';
  filter = { from: '', to: '' };

  activeReport: string = 'security';
  reports = [
    { key: 'team', label: 'Team Report', link: '/reports/team-report' },
    { key: 'leave', label: 'Leave Report', link: '/reports/leave-report' },
    { key: 'payroll', label: 'Payroll Report', link: '/reports/payroll-report' },
    { key: 'contact', label: 'Contact Report', link: '/reports/contact-report' },
    { key: 'security', label: 'Security Report', link: '/reports/security-report' },
    { key: 'wfh', label: 'Work From Home Report', link: '/reports/work-from-home-report' }
  ];

  constructor(private employeesService: EmployeesService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.filteredEmployees = [...this.employees];
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  applyFilters(): void {
    let filtered = [...this.employees];

    if (this.filter.from) {
      const fromDate = new Date(this.filter.from);
      filtered = filtered.filter(emp => new Date(emp.joiningDate) >= fromDate);
    }

    if (this.filter.to) {
      const toDate = new Date(this.filter.to);
      filtered = filtered.filter(emp => new Date(emp.joiningDate) <= toDate);
    }

    this.filteredEmployees = this.applySearchToList(filtered);
  }

  applySearch(): void {
    this.filteredEmployees = this.applySearchToList(this.filteredEmployees);
  }

  private applySearchToList(list: Employee[]): Employee[] {
    if (!this.searchText.trim()) return [...list];

    const searchLower = this.searchText.toLowerCase();
    return list.filter(emp =>
      (emp.firstname + ' ' + emp.lastName).toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.departmentId?.toString().includes(searchLower)
    );
  }

  trackById(index: number, emp: Employee): number {
    return emp.id!;
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    status = status.toLowerCase();
    return status === 'active' ? 'bg-success' :
           status === 'inactive' ? 'bg-warning text-dark' :
           status === 'on_leave' ? 'bg-info text-dark' : '';
  }

  exportToCSV(): void {
    if (!this.filteredEmployees.length) return;

    const headers = ['Name', 'Position', 'Team', 'Phone', 'Email', 'Status'];
    const rows = this.filteredEmployees.map(emp => [
      emp.firstname + ' ' + emp.lastName,
      emp.position,
      emp.team,
      emp.phone || 'N/A',
      emp.email,
      emp.status || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'security-report.csv');
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