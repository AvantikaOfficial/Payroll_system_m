import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  error: string | null = null;
  selectedEmployeeIdForDelete?: number;

  constructor(
    private employeesService: EmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeesService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error loading employees';
        this.loading = false;
      }
    });
  }

  confirmDelete(id: number) {
    this.selectedEmployeeIdForDelete = id;
  }

  deleteEmployee() {
    if (!this.selectedEmployeeIdForDelete) return;

    this.employeesService.deleteEmployee(this.selectedEmployeeIdForDelete).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.id !== this.selectedEmployeeIdForDelete);
        this.selectedEmployeeIdForDelete = undefined;
      },
      error: (err) => {
        alert('Error deleting employee: ' + (err.message || 'Unknown error'));
      }
    });
  }

  editEmployee(id: number): void {
    this.router.navigate(['/add-employee', id]);
  }
}
