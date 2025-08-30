import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  

export interface Employee {  
  id?: number;
  firstname: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  office: string;
  role: string;
  position: string;
  team: string;
  departmentId?: number;
  salary: number;
  currency?: string;
  frequency?: string;
  joiningDate: string;  // Format: 'YYYY-MM-DD'
  status: string;
    address?: string;
  inviteEmail?: boolean;
   employmentType?: string;
  countryOfEmployment?: string;
  lineManager?: string;
    leaveCount?: number; 

  // 🔹 Image fields
  image?: string | null;
  profileImage?: string | null;

  // 🔹 Employee details
  dob?: string;          
  bloodGroup?: string;
  website?: string;
  linkedin?: string;

  // 🔹 Employment info
  // ✅ Bank Details
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  bankAddress?: string;
  
}

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private apiUrl = 'http://localhost:3000/api/employees';

  constructor(private http: HttpClient) { }

  // getEmployees(): Observable<Employee[]> {
  //   return this.http.get<Employee[]>(this.apiUrl);
  // }

  // // Get single employee by id
  // getEmployee(id: number): Observable<Employee> {
  //   return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  // }

  // Get all employees
getEmployees(): Observable<Employee[]> {
  return this.http.get<Employee[]>(this.apiUrl).pipe(
    map((employees: Employee[]) =>
      employees.map(emp => ({
        ...emp,
        profileImage: emp.image 
          ? `http://localhost:3000/${emp.image}`
          : 'assets/default-avatar.png'
      }))
    )
  );
}

// Get single employee by id
getEmployee(id: number): Observable<Employee> {
  return this.http.get<Employee>(`${this.apiUrl}/${id}`).pipe(
    map(emp => ({
      ...emp,
      profileImage: emp.image 
        ? `http://localhost:3000${emp.image.replace(/\\/g, "/")}` // normalize slashes
        : 'assets/default-avatar.png'
    }))
  );
}


  // Add new employee
// Add new employee
addEmployee(employee: Employee | FormData): Observable<{ message: string; id: number }> {
  return this.http.post<{ message: string; id: number }>(this.apiUrl, employee);
}

// Update employee by id
updateEmployee(id: number, employee: Employee | FormData): Observable<{
  image: any; message: string 
}> {
return this.http.put<{ image: any; message: string }>(`${this.apiUrl}/${id}`, employee);
}
  // Delete employee by id
  deleteEmployee(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }


  updateEmployeeStatus(id: number, status: string): Observable<{ message: string }> {
  return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/status`, { status });
}

  
// employees.service.ts
updateEmployeeTeam(id: number, team: string) {
  return this.http.put(`${this.apiUrl}/${id}/team`, { team });
}


  getEmployeeImage(employeeId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${employeeId}/image`);
  }

}
