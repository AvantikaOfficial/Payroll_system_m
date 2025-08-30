import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id: number;
  firstname: string;
  lastName: string;
  image?: string;
  team?: string;
  status?: string;
}

export interface Team {
  id?: number;
  name: string;       // backend name
  status: string;
  members: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private baseUrl = 'http://localhost:3000'; // Backend URL

  constructor(private http: HttpClient) { }

  // Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  updateEmployeeStatus(empId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/employees/${empId}/status`, { status });
  }

  // Teams
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/teams`);
  }

  addTeam(name: string, memberIds: number[], status: string = 'Active'): Observable<any> {
    return this.http.post(`${this.baseUrl}/teams`, { name, memberIds, status });
  }

// team.service.ts
// team.service.ts
updateTeamStatus(teamId: number, status: string) {
  return this.http.put(`${this.baseUrl}/teams/${teamId}/status`, { status });
}
deleteTeam(teamId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/teams/${teamId}`);
}
updateTeam(team: { id: number; name: string; members: any[] }) {
  const memberIds = team.members.map(m => m.id); // send only employee IDs
  return this.http.put(`http://localhost:3000/teams/${team.id}`, {
    name: team.name,
    members: memberIds
  });
}

  
}
