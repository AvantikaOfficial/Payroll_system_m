import { Component, OnInit } from '@angular/core';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import { TeamService } from '../Services/Team-services/team.service';
import * as bootstrap from 'bootstrap';

interface Team {
  id?: number;
  team: string;       // display name
  name: string;       // backend name
  status: string;
  members: Employee[];
  selectedTeam?: Team;
}

@Component({
  selector: 'app-employee-team',
  templateUrl: './employee-team.component.html',
  styleUrls: ['./employee-team.component.scss']
})
export class EmployeeTeamComponent implements OnInit {
  selectedEmployeeId: number | null = null;
  employees: Employee[] = [];
  teams: Team[] = [];
  newTeamName: string = '';
  filteredTeams: Team[] = [];
  searchTerm: string = '';
  allEmployees: Employee[] = []; // master copy for filters
  selectedEmployeeIdForDelete?: number;
  loading = false;
  selectedSort: string = 'Newest';
  sortDropdownOpen: boolean = false;
customTeamName: string = '';  
 selectedTeam?: Team;

  backendBaseUrl = 'http://localhost:3000';

  constructor(
    private employeesService: EmployeesService,
    private teamservice: TeamService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
      this.loadTeams();
  }



  
  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data.map(emp => ({
          ...emp,
          image: emp.image
            ? emp.image.startsWith('http')
              ? emp.image
              : `${this.backendBaseUrl}${emp.image}?t=${new Date().getTime()}`
            : 'assets/default-avatar.png'
        }));
        this.buildTeams();
      },
      error: err => console.error('Failed to load employees:', err)
    });
  }

  buildTeams(): void {
    const teamMap: { [key: string]: Employee[] } = {};
    this.employees.forEach(emp => {
      const teamName = emp.team || 'No Team';
      if (!teamMap[teamName]) teamMap[teamName] = [];
      teamMap[teamName].push(emp);
    });

    this.teams = Object.keys(teamMap).map((teamName, index) => ({
      id: index + 1,
      team: teamName,
      name: teamName, // ✅ ensures name exists
      status: '',
      members: teamMap[teamName]
    }));
    this.filteredTeams = [...this.teams];
  }

  getEmployeeImage(emp: Employee): string {
    return emp.image ?? 'assets/default-avatar.png';
  }

  // Update team status
onStatusChange(team: Team): void {
  if (!team.id) return;

  this.teamservice.updateTeamStatus(team.id, team.status).subscribe({
    next: () => console.log(`Status updated: ${team.status}`),
    error: err => {
      console.error('Status update failed:', err);
      alert('Status update failed: ' + err.message);
    }
  });
}

  // Add new team
addTeam(): void {
  let teamNameToUse = this.newTeamName;

  // If "Create New" selected, use the entered custom name
  if (this.newTeamName === '__new') {
    if (!this.customTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    teamNameToUse = this.customTeamName.trim();
  }

  if (!teamNameToUse) {
    alert('Team name is required');
    return;
  }

  const empId = Number(this.selectedEmployeeId);
  const selectedEmployee = this.employees.find(emp => emp.id === empId);

  if (!selectedEmployee) {
    alert('Please select an employee to add to the team');
    return;
  }

this.employeesService.updateEmployeeTeam(selectedEmployee.id!, teamNameToUse).subscribe({
  next: () => {
    selectedEmployee.team = teamNameToUse;
    this.buildTeams();
    this.newTeamName = '';
    this.customTeamName = '';
    this.selectedEmployeeId = null;
  },    error: (err: any) => {
      console.error('Failed to add team:', err);
      alert('Failed to add team: ' + (err.message || 'Unknown error'));
    }
  });
}

  editTeam(team: any): void {
    console.log('Edit team:', team);
    // Example: Navigate to edit page or open modal
    // this.router.navigate(['/edit-team', team.id]);
  }

  deleteTeam(team: any): void {
    if (confirm(`Are you sure you want to delete team "${team.team}"?`)) {
      this.teamservice.deleteTeam(team.id).subscribe({
        next: () => {
          this.teams = this.teams.filter(t => t.id !== team.id);
          console.log('Team deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting team:', err);
        }
      });
    }
  }


loadTeams(): void {
  this.teamservice.getTeams().subscribe({
    next: (data: any[]) => {
      this.teams = data.map(t => ({
        id: t.id,
        team: t.name,  // display name
        name: t.name,
        status: t.status,
        members: t.members.map((m: any) => ({
          id: m.id,
          firstname: m.firstname,
          lastName: m.lastName,
          image: m.image ? `${this.backendBaseUrl}${m.image}?t=${new Date().getTime()}` : 'assets/default-avatar.png',
          email: m.email ?? '',
          office: m.office ?? '',
          salary: m.salary ?? 0,
          role: m.role ?? '',
          status: m.status ?? '',
          position: m.position ?? '',
          team: t.name
        }))
      }));
      this.filteredTeams = [...this.teams];
    },
    error: err => console.error('Failed to load teams:', err)
  });
}
  
  openDeleteModal(team: Team) {
    this.selectedTeam = team;
    const modal = new bootstrap.Modal(document.getElementById('delete_modal')!);
    modal.show();
  }

confirmDelete(): void {
  if (!this.selectedTeam || !this.selectedTeam.id) return;

  this.teamservice.deleteTeam(this.selectedTeam.id).subscribe({
    next: () => {
      // Remove team from frontend array
      this.teams = this.teams.filter(t => t.id !== this.selectedTeam!.id);
      this.filteredTeams = this.teams;
      this.selectedTeam = undefined;
      console.log('Team deleted permanently in DB');
      alert('Team deleted successfully!');
    },
    error: (err) => {
      console.error('Error deleting team:', err);
      alert('Failed to delete team in DB');
    }
  });
}

  onSearch() {
    const search = this.searchTerm.toLowerCase();
    this.filteredTeams = this.teams.filter(team =>
      team.name.toLowerCase().includes(search) ||
      team.members.some(m =>
        `${m.firstname} ${m.lastName}`.toLowerCase().includes(search)
      )
    );
  }

    toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  sortBy(option: string) {
    this.selectedSort = option;
    this.sortDropdownOpen = false;

    let sorted = [...this.allEmployees];

    switch (option) {
      case 'Newest':
        sorted.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
        break;
      case 'Oldest':
        sorted.sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime());
        break;
      case 'Descending':
        sorted.sort((a, b) => b.salary - a.salary);
        break;
      case 'Last Month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        sorted = sorted.filter(emp => new Date(emp.joiningDate) >= lastMonth);
        break;
      case 'Last 7 Days':
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        sorted = sorted.filter(emp => new Date(emp.joiningDate) >= last7Days);
        break;
    }

    this.employees = sorted;
  }

openEditModal(team: Team) {
  this.selectedTeam = {
    ...team,
    members: team.members.map(m => ({ ...m })) // deep copy
  };
  const modalEl = document.getElementById('edit_modal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}


saveEditTeam(): void {
  if (!this.selectedTeam) return;

  const duplicate = this.teams.find(
    t => t.name === this.selectedTeam!.team && t.id !== this.selectedTeam!.id
  );
  if (duplicate) {
    alert('This team name already exists!');
    return;
  }

  const updatedTeam = {
    id: this.selectedTeam.id!,
    name: this.selectedTeam.team,
    status: this.selectedTeam.status,
    members: this.selectedTeam.members.map(m => m.id!)
  };

  this.teamservice.updateTeam(updatedTeam).subscribe({
    next: () => {
      const index = this.teams.findIndex(t => t.id === this.selectedTeam!.id);
      if (index !== -1) this.teams[index] = { ...this.selectedTeam! };
      this.filteredTeams = [...this.teams];

      // ✅ check for null before closing modal
      const modalEl = document.getElementById('edit_modal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }

      this.selectedTeam = undefined;
      alert('Team updated successfully!');
    },
    error: err => {
      console.error('Update failed:', err);
      alert('Failed to update team: ' + err.message);
    }
  });
}

addMemberToTeam() {
  if (!this.selectedTeam || this.selectedEmployeeId == null) return;

  const empId = Number(this.selectedEmployeeId);
  const emp = this.employees.find(e => e.id === empId);
  if (!emp) return;

  // Avoid duplicates
  if (!this.selectedTeam.members.some(m => m.id === emp.id)) {
    this.selectedTeam.members.push(emp);

    // Send update to backend
    const updatedTeam = {
      id: this.selectedTeam.id!,
      name: this.selectedTeam.team,
      status: this.selectedTeam.status,
      members: this.selectedTeam.members.map(m => m.id!) // only ids
    };

    this.teamservice.updateTeam(updatedTeam).subscribe({
      next: () => {
        alert(`Employee ${emp.firstname} added to team successfully!`);
        this.loadTeams(); // reload from backend to keep data consistent
      },
      error: (err) => {
        console.error('Failed to update team members:', err);
        alert('Failed to add employee to team');
        // rollback in case of error
        this.selectedTeam!.members = this.selectedTeam!.members.filter(m => m.id !== emp.id);
      }
    });
  }

  this.selectedEmployeeId = null;
}

removeMemberFromTeam(emp: Employee) {
  if (!this.selectedTeam) return;
  this.selectedTeam.members = this.selectedTeam.members.filter(m => m.id !== emp.id);

  const updatedTeam = {
    id: this.selectedTeam.id!,
    name: this.selectedTeam.team,
    status: this.selectedTeam.status,
    members: this.selectedTeam.members.map(m => m.id!)
  };

  this.teamservice.updateTeam(updatedTeam).subscribe({
    next: () => console.log(`Employee ${emp.firstname} removed from team successfully!`),
    error: (err) => {
      console.error('Failed to remove employee from team:', err);
      alert('Failed to remove employee from team');
      // rollback
      this.selectedTeam!.members.push(emp);
    }
  });
}

  
}
