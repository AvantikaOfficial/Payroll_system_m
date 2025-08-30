import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Salary, SalaryService } from '../Services/Salary-services/salary.service';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import * as bootstrap from 'bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  salaries: Salary[] = [];
  salaryForm: FormGroup;
  employees: Employee[] = [];
  isEditMode = false;
  editSalaryId?: number;
  confirmDeleteSalaryId?: number;
  isSubmitting: boolean = false; // Prevent double clicks

  constructor(
    private salaryService: SalaryService,
    private employeeService: EmployeesService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.salaryForm = this.fb.group({
      id: [null],
      employee_id: ['', Validators.required],
      basic: [0, Validators.required],
      hra: [0, Validators.required],
      total: [0],
      date: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSalaries();
    this.loadEmployees();
  }

  loadSalaries() {
    this.salaryService.getSalaries().subscribe({
      next: data => this.salaries = data,
      error: err => console.error('Error loading salaries:', err)
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: data => this.employees = data,
      error: err => console.error('Error loading employees:', err)
    });
  }

  onEmployeeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedId = Number(select.value);
    this.salaryForm.patchValue({ employee_id: selectedId });

    const emp = this.employees.find(e => e.id === selectedId);
    if (emp) {
      this.salaryForm.patchValue({ basic: emp.salary || 0 });
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.isSubmitting = false;
    this.salaryForm.reset({ status: 'Pending', basic: 0, hra: 0, total: 0 });
    this.editSalaryId = undefined;

    const modalEl = document.getElementById('salaryModal');
    if (modalEl) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  openEditModal(salary: Salary) {
    this.isEditMode = true;
    this.isSubmitting = false;
    this.editSalaryId = salary.id;
    this.salaryForm.patchValue({
      employee_id: salary.employee_id,
      basic: salary.basic,
      hra: salary.hra,
      total: salary.total,
      date: salary.date,
      status: salary.status
    });

    const modalEl = document.getElementById('salaryModal');
    if (modalEl) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

saveSalary() {
  if (this.salaryForm.invalid || this.isSubmitting) return;

  this.isSubmitting = true; // Prevent double clicks
  const formValue = this.salaryForm.value;
  formValue.total = Number(formValue.basic) + Number(formValue.hra);

  if (this.isEditMode && this.editSalaryId !== undefined) {
    this.salaryService.updateSalary(this.editSalaryId, formValue).subscribe({
      next: (res) => {
        // Update table immediately
        const index = this.salaries.findIndex(s => s.id === this.editSalaryId);
        if (index !== -1) this.salaries[index] = { ...formValue, id: this.editSalaryId };

        alert('Salary updated successfully!');
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  } else {
    this.salaryService.addSalary(formValue).subscribe({
      next: (res: any) => {
        // Push new salary to table immediately
        this.salaries.unshift({ ...formValue, id: res.id });

        alert('Salary added successfully!');
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }
}

closeModal() {
  const modalEl = document.getElementById('salaryModal');
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();
  }
}

  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstname} ${emp.lastName}` : 'Unknown';
  }

  deleteSalary(id?: number) {
    if (!id) return;
    this.salaryService.deleteSalary(id).subscribe({
      next: () => {
        this.loadSalaries();
        alert('Salary deleted successfully!');
      },
      error: err => console.error('Error deleting salary:', err)
    });
  }

  onStatusChange(salary: any) {
    const url = `http://localhost:3000/api/salary/${salary.id}/status`;
    this.http.put(url, { status: salary.status }).subscribe({
      next: () => console.log('Status updated'),
      error: err => console.error(err)
    });
  }

  openDeleteModal(id: number) {
    this.confirmDeleteSalaryId = id;
  }
}
