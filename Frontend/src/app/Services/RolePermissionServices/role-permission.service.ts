import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Member {
  id: number;
  name: string;
  avatarUrl: string | null;
}
export interface Role {
  id: number;
  roleName: string;
  members: Member[];
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  addRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  updateRole(id: number, role: { roleName: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/roles/${id}`);
  }
}