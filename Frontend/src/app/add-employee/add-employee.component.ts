import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import flatpickr from 'flatpickr';
import { DepartmentService } from '../Services/Department-serives/department.service';

enum FormStatus {
  Pending = 'Pending',
  Success = 'Success',
  Error = 'Error'
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit, AfterViewInit {
  employeeForm: FormGroup;
  employeeId?: number;
  formStatus: FormStatus = FormStatus.Pending;
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  departments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeesService: EmployeesService,
    private departmentService: DepartmentService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      // Basic Details
      firstname: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dob: ['', Validators.required],        // ✅ Date of Birth
      address: ['', Validators.required],    // ✅ Address
      inviteEmail: [false],
      image: [null],

      // Employment Details
      office: ['', Validators.required],
      joiningDate: [''],
      position: [''],
      team: [''],
      employmentType: [''],
      countryOfEmployment: [''],
      lineManager: [''],
      currency: [''],
      frequency: [''],
      salary: [0, [Validators.min(0)]],
      departmentId: [1, [Validators.required, Validators.min(1)]],
      status: [''],
      role: [''],
      name: [''],

      // Bank Details
      bankName: ['', Validators.required],
      bankAccountNo: ['', Validators.required],
      ifscCode: ['', Validators.required],
      bankAddress: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        console.log('Employee ID on init:', this.employeeId); // ← Add this
        this.loadEmployeeData(this.employeeId);
      }
    });

    // Load departments list
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Failed to load departments', err);
      }
    });
  }

  loadEmployeeData(id: number): void {
    const backendBaseUrl = 'http://localhost:3000'; // <-- Your backend URL

    this.employeesService.getEmployee(id).subscribe({
      next: (employee: Employee) => {
        // Patch form values
        this.employeeForm.patchValue({
          firstName: employee.firstname,
          lastName: employee.lastName,
          email: employee.email,
          inviteEmail: employee.inviteEmail ?? false,
          office: employee.office,
          joiningDate: employee.joiningDate,
          position: employee.position,
          status: employee.status,
          team: employee.team,
          employmentType: employee.employmentType,
          countryOfEmployment: employee.countryOfEmployment,
          lineManager: employee.lineManager,
          currency: employee.currency,
          frequency: employee.frequency,
          salary: employee.salary,
          departmentId: employee.departmentId ?? 1,
          role: employee.role,
          name: employee.name,
          phone: employee.phone || '',
          dob: employee.dob || '',
          address: employee.address || '',
          bankName: employee.bankName || '',
          bankAccountNo: employee.bankAccountNo || '',
          ifscCode: employee.ifscCode || '',
          bankAddress: employee.bankAddress || ''
        });

        // Set image preview correctly
        if (employee.image) {
          this.imagePreview = employee.image.startsWith('http')
            ? employee.image + `?t=${new Date().getTime()}`
            : backendBaseUrl + employee.image + `?t=${new Date().getTime()}`;
          this.imageFile = null; // no new file selected yet
        } else {
          this.imagePreview = null;
        }
      },
      error: err => {
        console.error('Failed to load employee data', err);
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPG and PNG formats are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image must be less than 5MB.');
      return;
    }

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.employeeForm.patchValue({ image: reader.result }); // ✅ Set Base64 string to form
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    console.log('Employee ID on submit:', this.employeeId);
    this.formStatus = FormStatus.Pending;

    if (this.employeeForm.valid) {
      const formData = new FormData();

      // Append all form fields manually
      formData.append('firstname', this.employeeForm.get('firstName')?.value); // backend expects 'firstname'
      formData.append('lastName', this.employeeForm.get('lastName')?.value);
      formData.append('email', this.employeeForm.get('email')?.value);
      formData.append('phone', this.employeeForm.get('phone')?.value);
      formData.append('dob', this.employeeForm.get('dob')?.value);           // ✅ DOB
      formData.append('address', this.employeeForm.get('address')?.value);   // ✅ Address
      formData.append('inviteEmail', this.employeeForm.get('inviteEmail')?.value);
      formData.append('office', this.employeeForm.get('office')?.value);
      formData.append('joiningDate', this.employeeForm.get('joiningDate')?.value);
      formData.append('position', this.employeeForm.get('position')?.value);
      formData.append('team', this.employeeForm.get('team')?.value);
      formData.append('employmentType', this.employeeForm.get('employmentType')?.value);
      formData.append('countryOfEmployment', this.employeeForm.get('countryOfEmployment')?.value);
      formData.append('lineManager', this.employeeForm.get('lineManager')?.value);
      formData.append('currency', this.employeeForm.get('currency')?.value);
      formData.append('frequency', this.employeeForm.get('frequency')?.value);
      formData.append('salary', this.employeeForm.get('salary')?.value.toString());
      formData.append('departmentId', this.employeeForm.get('departmentId')?.value.toString());
      formData.append('status', this.employeeForm.get('status')?.value);
      formData.append('role', this.employeeForm.get('role')?.value);
      formData.append('name', this.employeeForm.get('name')?.value);

      // Bank Details
      formData.append('bankName', this.employeeForm.get('bankName')?.value);
      formData.append('bankAccountNo', this.employeeForm.get('bankAccountNo')?.value);
      formData.append('ifscCode', this.employeeForm.get('ifscCode')?.value);
      formData.append('bankAddress', this.employeeForm.get('bankAddress')?.value);

      // Image file if selected
      if (this.imageFile) {
        formData.append('image', this.imageFile, this.imageFile.name);
      } else if (this.imagePreview) {
        // Use old image path
        formData.append('image', this.employeeForm.get('image')?.value || '');
      }

      if (this.employeeId) {
        this.employeesService.updateEmployee(this.employeeId, formData).subscribe({
          next: (response) => {
            this.imagePreview = response.image
              ? `${response.image}?t=${new Date().getTime()}`
              : null;
            alert(response.message);
            this.router.navigate(['/employees']);
          },
          error: err => {
            alert('Failed to update employee');
            console.error(err);
          }
        });
      }
      else {
        this.employeesService.addEmployee(formData).subscribe({
          next: () => {
            this.formStatus = FormStatus.Success;
            alert('Employee added successfully!');
            this.router.navigate(['/employees'], {
              queryParams: { reload: new Date().getTime() }
            });
          },
          error: (err) => {
            this.formStatus = FormStatus.Error;
            console.error('Add failed', err);
            alert(`Could not connect to the backend.`);
          }
        });
      }
    } else {
      this.formStatus = FormStatus.Error;
      this.employeeForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.employeeForm.reset({
      inviteEmail: false,
      salary: 0,
      departmentId: 1,
      dob: '',
      address: '',
      bankName: '',
      bankAccountNo: '',
      ifscCode: '',
      bankAddress: ''
    });
    this.router.navigate(['/employees']);
  }

  ngAfterViewInit(): void {
    flatpickr("[data-provider='flatpickr']", {
      dateFormat: "d M, Y",
    });
  }



} 