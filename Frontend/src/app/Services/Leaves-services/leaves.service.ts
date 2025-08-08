import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leave } from '../../models/leave.model';  // Import only

@Injectable({
  providedIn: 'root'
})
export class LeavesService {
  private apiUrl = 'http://localhost:3000/api/leaves';

  constructor(private http: HttpClient) {}

  getAllLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl);  // Fix URL here
  }

  createLeave(leave: Leave): Observable<any> {
    return this.http.post(this.apiUrl, leave);
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateLeave(id: number, leave: Leave): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}`, leave);
  }
}
