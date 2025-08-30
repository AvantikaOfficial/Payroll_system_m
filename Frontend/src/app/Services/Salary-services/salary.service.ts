import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalaryTransaction } from '../../models/salary.model';


export interface Salary {
  id?: number;
  employee: string;
  basic: number;
  hra: number;
  total: number;
  date: string;  
  status: string;
  employee_id: number;
}
@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private apiUrl = 'http://localhost:3000/api/salary';

  constructor(private http: HttpClient) {}

  getSalaries(): Observable<Salary[]> {
    return this.http.get<Salary[]>(this.apiUrl);
  }

  addSalary(salary: Salary): Observable<Salary> {
    return this.http.post<Salary>(this.apiUrl, salary);
  }

  updateSalary(id: number, salary: Salary): Observable<Salary> {
    return this.http.put<Salary>(`${this.apiUrl}/${id}`, salary);
  }

  deleteSalary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
getSalaryByEmployee(employeeId: number): Observable<SalaryTransaction[]> {
  return this.http.get<SalaryTransaction[]>(`${this.apiUrl}?employeeId=${employeeId}`);
}

  getSalaryById(id: number): Observable<Salary> {
    return this.http.get<Salary>(`${this.apiUrl}/${id}`);                     
  }

updateSalaryStatus(id: number, status: string) {
  return this.http.put(`${this.apiUrl}/${id}/status`, { status });
}
getAllSalary() {
  return this.http.get<any[]>('http://localhost:3000/api/salary');
}
}
