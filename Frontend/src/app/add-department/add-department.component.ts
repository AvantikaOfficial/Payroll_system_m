import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../Services/Department-serives/department.service';
import { Department } from '../Services/Department-serives/department.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss']
})
export class AddDepartmentComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  departmentId!: number;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize form
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      status: ['active'],
      description: ['']
    });

    // Check if we are in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.departmentId = +id;
        this.loadDepartment(this.departmentId);
      }
    });
  }

  // Load existing department data for editing
  loadDepartment(id: number): void {
    this.departmentService.getDepartmentById(id).subscribe({
      next: (department: Department) => {
        this.departmentForm.patchValue(department);
      },
      error: (err) => {
        console.error('Error loading department', err);
        alert('Unable to load department data');
      }
    });
  }

  // Form submit handler
  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const departmentData = this.departmentForm.value;
if (this.isEditMode) {
  if (!this.departmentId) {
    alert('Department ID is missing!');
    return;
  }
  
  this.departmentService.updateDepartment(this.departmentId, departmentData).subscribe({
    next: () => {
      alert('✅ Department updated successfully!');
      this.router.navigate(['/departments'], { state: { message: 'updated' } });
    },
    error: (err) => {
      console.error('Update failed', err);
      alert(`❌ Failed to update department. ${err?.error?.message || ''}`);
    }
  });
}
else {
      // Add new department
      this.departmentService.addDepartment(departmentData).subscribe({
        next: () => {
          alert('✅ Department added successfully!');
          this.router.navigate(['/departments'], { state: { message: 'added' } });
        },
        error: (err) => {
          console.error('Add failed', err);
          alert('❌ Failed to add department.');
        }
      });
    }
  }
}