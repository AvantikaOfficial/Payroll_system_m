import { Component, OnInit } from '@angular/core';
import { SalaryService, Salary } from 'src/app/Services/Salary-services/salary.service';
import { EmployeesService, Employee } from 'src/app/Services/Employees-serives/employees.service';

@Component({
  selector: 'app-payroll-report',
  templateUrl: './payroll-report.component.html',
  styleUrls: ['./payroll-report.component.scss']
})
export class PayrollReportComponent implements OnInit {

  payrolls: any[] = [];          // Combined salary + employee info
  employees: Employee[] = [];
  filteredPayrolls: any[] = [];
  searchText: string = '';
  filter = { from: '', to: '' };

  constructor(
    private salaryService: SalaryService,
    private employeeService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: emps => {
        this.employees = emps;
        this.loadPayrolls();
      },
      error: err => console.error(err)
    });
  }

  loadPayrolls() {
    this.salaryService.getSalaries().subscribe({
      next: salaries => {
        // Combine salary + employee info
        this.payrolls = salaries.map(s => {
          const emp = this.employees.find(e => e.id === s.employee_id);
          return {
            id: s.id,
            name: emp ? `${emp.firstname} ${emp.lastName}` : 'Unknown',
            email: emp?.email || 'N/A',
            status: s.status,
            salary: Number(s.basic) + Number(s.hra),
            bank_name: emp?.bankName || 'N/A',
            account_number: emp?.bankAccountNo || 'N/A',
            date: s.date
          };
        });
        this.filteredPayrolls = [...this.payrolls];
      },
      error: err => console.error(err)
    });
  }

  applyFilters() {
    const fromDate = this.filter.from ? new Date(this.filter.from) : null;
    const toDate = this.filter.to ? new Date(this.filter.to) : null;

    this.filteredPayrolls = this.payrolls.filter(p => {
      const payrollDate = new Date(p.date || Date.now());
      if (fromDate && payrollDate < fromDate) return false;
      if (toDate && payrollDate > toDate) return false;
      return true;
    });
    this.applySearch();
  }

  applySearch() {
    if (!this.searchText) return;
    const lower = this.searchText.toLowerCase();
    this.filteredPayrolls = this.filteredPayrolls.filter(p =>
      p.name.toLowerCase().includes(lower) || p.email.toLowerCase().includes(lower)
    );
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
