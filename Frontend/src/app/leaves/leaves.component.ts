import { Component } from '@angular/core';
import { LeavesService } from '../Services/Leaves-services/leaves.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeesService } from '../Services/Employees-serives/employees.service';
import { Leave } from '../models/leave.model';
import { Router } from '@angular/router';


declare var bootstrap: any;

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent {
  // leaves: Leave[] = [];
  leaveForm!: FormGroup;
  employees: any[] = [];
  selectedLeaveIdToDelete: number | null = null;
  isEditMode: boolean = false;
  totalLeaves: number = 12;
  usedLeaves: number = 0;
  remainingLeaves: number = this.totalLeaves;
  selectedEmployeeId!: number;
  appliedDays: number = 0; // from "Number of Days Leave" input
  leaves: Array<any> = []; // your list of leaves (must be loaded before calc)

  constructor(
    private fb: FormBuilder,
    private leavesService: LeavesService,
    private employeesService: EmployeesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // initialize form once
    this.leaveForm = this.fb.group({
      id: [null],
      employee_id: [null, Validators.required],   // force number
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      duration: ['Full Day', Validators.required],
      reason: [''],
      status: ['pending'],
      days: [0],
    });

    this.loadLeaves();
    this.loadEmployees();
    this.watchLeaveForm();


this.leaveForm.valueChanges.subscribe(val => {
  if (!this.isEditMode) return;

  const empId = val.employee_id;
  const appliedDays = val.start_date && val.end_date 
    ? this.calculateDays(val.start_date, val.end_date)
    : 0;

  const excludeId = val.id;
  const usedDays = this.leaves
    .filter(l => l.employee_id === empId && l.status === 'approved' && l.id !== excludeId)
    .reduce((sum, l) => sum + (l.days || 0), 0);

  this.usedLeaves = usedDays + appliedDays;
  this.remainingLeaves = this.totalLeaves - this.usedLeaves;
});

  }



  /** wire live updates */
  private setupLiveCalc(): void {
    // When any relevant field changes, recompute
    this.leaveForm.valueChanges.subscribe(() => this.recompute());
  }

  /** safe number helper */
  private toNum(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  /** main calculation: show already used (excluding current) + remaining */
  private recompute(): void {
    if (!Array.isArray(this.leaves) || this.leaves.length === 0) {
      // leaves not loaded yet; show base
      this.usedLeaves = 0;
      this.remainingLeaves = this.totalLeaves;
      return;
    }

    const employeeId = this.toNum(this.leaveForm.get('employee_id')?.value);
    const excludeId = this.toNum(this.leaveForm.get('id')?.value);

    if (!employeeId) {
      this.usedLeaves = 0;
      this.remainingLeaves = this.totalLeaves;
      return;
    }

    // sum approved leaves for this employee, EXCLUDING the one being edited
    const used = this.leaves
      .filter(l =>
        this.toNum(l.employee_id) === employeeId &&
        (l.status === 'approved' || l.status === 'Approved') &&
        this.toNum(l.id) !== excludeId
      )
      .reduce((sum, l) => sum + this.toNum(l.days), 0);

    this.usedLeaves = used;
    this.remainingLeaves = this.totalLeaves - used; // NOTE: not subtracting current form days
  }

  loadLeaves(): void {
    this.leavesService.getAllLeaves().subscribe({
      next: (data) => {
        const leavesArray = data as any[];
        this.leaves = leavesArray.map(leave => ({
          ...leave,
          id: +leave.id,
          employee_id: +leave.employee_id,
          status: (leave.status || 'pending').toLowerCase() === 'approved' ? 'Approved' : 'Pending',
          days: (leave.days != null && Number.isFinite(+leave.days) && +leave.days > 0)
            ? +leave.days
            : this.calculateDays(leave.start_date, leave.end_date),
        }));
      },
      error: (err) => console.error('Error loading leaves:', err)
    });

  }

  // calculateDays(start: string, end: string): number {
  //   const startDate = new Date(start);
  //   const endDate = new Date(end);
  //   const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  //   return Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
  // }

  calculateRemainingLeaves() {
    this.remainingLeaves = this.totalLeaves - this.usedLeaves;
  }
  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: any) => (this.employees = data),
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  initForm(): void {
    this.leaveForm = this.fb.group({
      id: [null],
      employee_id: ['', Validators.required],
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      duration: ['Full Day', Validators.required], // ← make sure this exists      reason: ['']
    });
  }

  findInvalidControls(): string[] {
    const invalid: string[] = [];
    const controls = this.leaveForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSubmit(): void {
    console.log('Submitting leave with values:', this.leaveForm.value);

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      console.warn('Form is invalid', this.leaveForm.value);
      console.error('Invalid Controls:', this.findInvalidControls());
      return;
    }

    if (this.isEditMode) {
      const leaveId = this.leaveForm.get('id')?.value;
      this.leavesService.updateLeave(leaveId, this.leaveForm.value).subscribe({
        next: () => {
          this.leaveForm.reset();
          this.isEditMode = false;
          this.loadLeaves();
          this.closeModal('addLeaveModal');
        },
        error: (err) => console.error('Update leave failed:', err)
      });
    } else {
      this.leavesService.createLeave(this.leaveForm.value).subscribe({
        next: () => {
          this.leaveForm.reset();
          this.loadLeaves();
          this.closeModal('addLeaveModal');
          this.router.navigate(['/leaves']);  // ← Navigate to leaves list
        },
        error: (err) => console.error('Create leave failed:', err)
      });
    }
  }

  confirmDelete(leaveId?: number): void {
    if (leaveId === undefined) return;
    if (confirm('Are you sure you want to delete this leave?')) {
      this.leavesService.deleteLeave(leaveId).subscribe({
        next: () => {
          this.loadLeaves();
          alert('Leave deleted successfully');
        },
        error: (err) => console.error('Failed to delete leave:', err)
      });
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstname} ${employee.lastName}` : 'Unknown';
  }



  // openEditModal(leave: Leave): void {
  //   this.isEditMode = true;

  //   this.leaveForm.patchValue({
  //     id: leave.id,
  //     employee_id: leave.employee_id,
  //     leave_type: leave.leave_type || '',
  //     start_date: this.formatDateToInput(leave.start_date),
  //     end_date: this.formatDateToInput(leave.end_date),
  //     reason: leave.reason,
  //     status: leave.status || 'pending',
  //     duration: leave.duration || 'Full Day',
  //     days: leave.days || this.calculateDays(leave.start_date, leave.end_date)
  //   });

  //   // ✅ main fix: calculate used leaves excluding this leave
  //   const used = this.getUsedLeaves(leave.employee_id, leave.id);
  //   this.usedLeaves = used;

  //   // ✅ remaining leaves = total - used
  //   this.remainingLeaves = this.totalLeaves - used;

  //   // show modal
  //   const modalEl = document.getElementById('addLeaveModal');
  //   if (modalEl) {
  //     bootstrap.Modal.getOrCreateInstance(modalEl).show();
  //   }
  // }


  calculateLeaves(employeeId: number, excludeLeaveId?: number): void {
    const used = this.leaves
      .filter(l =>
        l.employee_id === employeeId &&
        l.status === 'approved' &&
        l.id !== excludeLeaveId
      )
      .reduce((sum, l) => sum + (l.days || 0), 0);

    this.usedLeaves = used;
    this.remainingLeaves = this.totalLeaves - used;
  }



  getRemainingLeaves(employeeId: number, excludeLeaveId?: number): number {
    const usedDays = this.leaves
      .filter(
        l =>
          l.employee_id === employeeId &&
          l.status === 'approved' &&
          l.id !== excludeLeaveId   // ✅ edit करताना तो leave exclude करतो
      )
      .reduce((sum, l) => sum + (l.days || 0), 0);

    return this.totalLeaves - usedDays;
  }

  // ✅ helper functions
  // getUsedLeaves(employeeId: number, excludeLeaveId?: number): number {
  //   return this.leaves
  //     .filter(
  //       l =>
  //         l.employee_id === employeeId &&
  //         l.status === 'approved' &&
  //         l.id !== excludeLeaveId
  //     )
  //     .reduce((sum, l) => sum + (l.days || 0), 0);
  // }

  onEmployeeSelect(employeeId: number) {
    // 1️⃣ Get all approved leaves for this employee
    const empLeaves = this.leaves.filter(
      l => l.employee_id === employeeId && l.status === 'approved'
    );

    // 2️⃣ Calculate used leaves
    this.usedLeaves = empLeaves.reduce((sum, l) => sum + Number(l.days || 0), 0);

    // 3️⃣ Calculate remaining leaves
    this.remainingLeaves = this.totalLeaves - this.usedLeaves;
  }

  // onEmployeeChange(event: any) {
  //   const employeeId = +event.target.value;

  //   if (!employeeId) {
  //     this.usedLeaves = 0;
  //     this.remainingLeaves = this.totalLeaves;
  //     return;
  //   }

  //   const excludeId = this.isEditMode ? +this.leaveForm.get('id')?.value : undefined;

  //   const used = this.getUsedLeaves(employeeId, excludeId);
  //   this.usedLeaves = used;
  //   this.remainingLeaves = this.totalLeaves - used;

  //   // optional: update current applied days if start/end selected
  //   const start = this.leaveForm.get('start_date')?.value;
  //   const end = this.leaveForm.get('end_date')?.value;
  //   if (start && end) {
  //     const appliedDays = this.calculateDays(start, end);
  //     this.leaveForm.patchValue({ days: appliedDays }, { emitEvent: false });
  //     this.remainingLeaves -= appliedDays; // subtract current applied leave
  //   }
  // }
  updateLeavesForEmployee(employeeId: number, excludeLeaveId?: number) {
    if (!employeeId) {
      this.usedLeaves = 0;
      this.remainingLeaves = this.totalLeaves;
      return;
    }

    // approved leaves, exclude current if editing
    const used = this.leaves
      .filter(l => l.employee_id === employeeId && l.status === 'approved' && l.id !== excludeLeaveId)
      .reduce((sum, l) => sum + (l.days || 0), 0);

    this.usedLeaves = used;
    this.remainingLeaves = this.totalLeaves - used;
  }


  formatDateToInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }


  onSelectEmployee(employeeId: number) {
    this.getRemainingLeaves(employeeId);
  }
  updateRemainingLeaves() {
    if (!this.selectedEmployeeId) {
      this.remainingLeaves = this.totalLeaves;
      return;
    }

    const usedDays = this.leaves
      .filter(l => l.employee_id === this.selectedEmployeeId && l.status === 'approved')
      .reduce((sum, l) => sum + (l.days || 0), 0);

    this.remainingLeaves = this.totalLeaves - usedDays;
  }

  // 🔹 Watch for changes in form
  // watchLeaveForm(): void {
  //   this.leaveForm.valueChanges.subscribe(val => {
  //     const appliedDays = (val.start_date && val.end_date)
  //       ? this.calculateDays(val.start_date, val.end_date)
  //       : 0;

  //     this.leaveForm.patchValue({ days: appliedDays }, { emitEvent: false });

  //     this.usedLeaves = this.getAlreadyUsedLeaves(val.employee_id);

  //     this.remainingLeaves = this.totalLeaves - this.usedLeaves - appliedDays;
  //   });
  // }

  // 🔹 Calculate no. of days between start & end
  // calculateDays(start: string, end: string): number {
  //   const startDate = new Date(start);
  //   const endDate = new Date(end);

  //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  //     return 0;
  //   }

  //   const diffTime = endDate.getTime() - startDate.getTime();
  //   const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  //   return days > 0 ? days : 0;
  // }

  // 🔹 Get already approved leaves for employee
  getAlreadyUsedLeaves(employeeId: number): number {
    if (!employeeId) return 0;

    return this.leaves
      .filter(l => l.employee_id === +employeeId && l.status === 'approved')
      .reduce((sum, l) => sum + (l.days || 0), 0);
  }



  openEditModal(leave: Leave) {
  this.isEditMode = true;

  this.leaveForm.patchValue({
    id: leave.id,
    employee_id: leave.employee_id,
    leave_type: leave.leave_type,
    start_date: this.formatDateToInput(leave.start_date),
    end_date: this.formatDateToInput(leave.end_date),
    reason: leave.reason,
    status: leave.status,
    duration: leave.duration || 'Full Day',
    days: leave.days || this.calculateDays(leave.start_date, leave.end_date)
  });

  // ✅ update used & remaining leaves automatically
  this.updateUsedAndRemainingLeaves(leave.employee_id);

  const modalEl = document.getElementById('addLeaveModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}



  // 🔹 Employee change watcher (edit or add)
  onEmployeeChange(event: any) {

    const employeeId = +event.target.value;
    const excludeId = this.isEditMode ? +this.leaveForm.get('id')?.value : undefined;
      this.updateUsedAndRemainingLeaves(employeeId); 

    if (!employeeId) {
      this.usedLeaves = 0;
      this.remainingLeaves = this.totalLeaves;
      return;
    }

    const usedDays = this.getUsedLeaves(employeeId, excludeId);

    this.usedLeaves = usedDays;
    this.remainingLeaves = this.totalLeaves - usedDays;
  }

  // 🔹 Get approved leaves for employee excluding current (edit)
  getUsedLeaves(employeeId: number, excludeLeaveId?: number): number {
    return this.leaves
      .filter(l => l.employee_id === employeeId && l.status === 'approved' && l.id !== excludeLeaveId)
      .reduce((sum, l) => sum + (l.days || 0), 0);
  }

  // 🔹 Watch start_date & end_date changes to auto update applied days
  watchLeaveForm(): void {
    this.leaveForm.valueChanges.subscribe(val => {
      const appliedDays = (val.start_date && val.end_date)
        ? this.calculateDays(val.start_date, val.end_date)
        : 0;

      this.leaveForm.patchValue({ days: appliedDays }, { emitEvent: false });

      const employeeId = val.employee_id;
      const excludeId = this.isEditMode ? val.id : undefined;
      const used = this.getUsedLeaves(employeeId, excludeId);

      this.usedLeaves = used;
      this.remainingLeaves = this.totalLeaves - used - appliedDays;
    });
  }

  // 🔹 Calculate no. of days between start & end
  calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  // updateUsedAndRemainingLeaves(employeeId: number): void {
  //   if (!employeeId) {
  //     this.usedLeaves = 0;
  //     this.remainingLeaves = this.totalLeaves;
  //     return;
  //   }

  //   const excludeId = this.isEditMode ? +this.leaveForm.get('id')?.value : undefined;

  //   // Already approved leaves
  //   const usedDays = this.leaves
  //     .filter(l => l.employee_id === employeeId && l.status === 'approved' && l.id !== excludeId)
  //     .reduce((sum, l) => sum + (l.days || 0), 0);

  //   this.usedLeaves = usedDays;
  //   this.remainingLeaves = this.totalLeaves - usedDays;
  // }

openAddModal(): void {
  this.isEditMode = false;

  // Reset the form
  this.leaveForm.reset({
    employee_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    duration: 'Full Day',
    reason: '',
    status: 'pending',
    days: 0
  });

  // Show the modal
  const modalEl = document.getElementById('addLeaveModal');
  if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
}
  updateUsedAndRemainingLeaves(employeeId: number): void {
  if (!employeeId) {
    this.usedLeaves = 0;
    this.remainingLeaves = this.totalLeaves;
    return;
  }

  const excludeId = this.isEditMode ? +this.leaveForm.get('id')?.value : undefined;

  const usedDays = this.leaves
    .filter(l => l.employee_id === employeeId && l.status === 'approved' && l.id !== excludeId)
    .reduce((sum, l) => sum + (l.days || 0), 0);

  this.usedLeaves = usedDays;
  this.remainingLeaves = this.totalLeaves - usedDays;
}


 onStatusChange(leave: Leave) {
  if (!leave.id) return;

  // API call to update leave status
  this.leavesService.updateLeave(leave.id, { ...leave }).subscribe({
    next: () => {
      console.log('Leave status updated successfully');
      // Optional: show success toast/alert
    },
    error: (err) => console.error('Failed to update leave status:', err)
  });
}

}