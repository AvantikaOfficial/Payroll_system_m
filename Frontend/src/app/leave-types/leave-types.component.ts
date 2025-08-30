import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as bootstrap from 'bootstrap';
import { LeaveTypesService } from '../Services/leaves-type/leave-type.service';

@Component({
  selector: 'app-leave-types',
  templateUrl: './leave-types.component.html',
  styleUrls: ['./leave-types.component.scss']
})
export class LeaveTypesComponent implements OnInit {
  leaveTypes: any[] = [];
  addForm!: FormGroup;
  editForm!: FormGroup;
  selectedLeave: any;
  apiUrl = 'http://localhost:3000/api/leave-types';

  constructor(private fb: FormBuilder, private http: HttpClient,
    private LeaveTypeService :LeaveTypesService
  ) { }

  ngOnInit() {
    this.addForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      id: [null],
      name: ['', Validators.required]
    });

    this.loadLeaveTypes();
  }

  loadLeaveTypes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.leaveTypes = data,
      error: err => console.error('Error loading leave types', err)
    });
  }

  // ✅ Add leave
// Add leave
addLeave(modalRef: any) {
  if (this.addForm.invalid) return;

  this.http.post(this.apiUrl, this.addForm.value).subscribe({
    next: () => {
      this.loadLeaveTypes();   // refresh list
      this.addForm.reset();
      const modal = bootstrap.Modal.getInstance(modalRef); // ✅ close modal correctly
      modal?.hide();
    },
    error: err => console.error('Error adding leave', err)
  });
}
  // ✅ Open edit modal
  openEditModal(leave: any, modalRef: any) {
    this.selectedLeave = leave;
    this.editForm.patchValue(leave);
    const modal = new bootstrap.Modal(modalRef);
    modal.show();
  }
  saveEdit(modalRef: any) {
    if (this.editForm.invalid) return;

    this.http.put(`${this.apiUrl}/${this.editForm.value.id}`, this.editForm.value).subscribe({
      next: () => {
        this.loadLeaveTypes();
        const modal = bootstrap.Modal.getInstance(modalRef);
        modal?.hide();
      }
    });
  }

  // ✅ Open delete modal
openDeleteModal(id: number, modalRef: any) {
  this.selectedLeave = id;
  const modal = new bootstrap.Modal(modalRef); // Create Modal instance
  modal.show();
}

confirmDelete(modalRef: any) {
  this.http.delete(`${this.apiUrl}/${this.selectedLeave}`).subscribe({
    next: () => {
      this.loadLeaveTypes(); // refresh list
      const modal = bootstrap.Modal.getInstance(modalRef); // get existing instance
      modal?.hide();
    },
    error: err => console.error('Error deleting leave', err)
  });
}
}
