import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RolePermissionService } from '../Services/RolePermissionServices/role-permission.service';

export interface Member {
  id: number;
  name: string;
  avatarUrl: string | null;   // ✅ fixed
}

export interface Role {
  id: number;
  roleName: string;
  members: Member[];
}

@Component({
  selector: 'app-manage-super-admin',
  templateUrl: './manage-super-admin.component.html',
  styleUrls: ['./manage-super-admin.component.scss']
})
export class ManageSuperAdminComponent {
  roles: Role[] = [];
  isLoading = false;

  constructor(
    private roleService: RolePermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  fetchRoles(): void {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (res: Role[]) => {
        this.roles = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
        this.isLoading = false;
      }
    });
  }

  addRole(): void {
    const roleName = prompt('Enter new role name:');
    if (!roleName?.trim()) return;
    this.roleService.addRole({ roleName }).subscribe({
      next: () => this.fetchRoles(),
      error: (err) => console.error('Error adding role:', err)
    });
  }

  editRole(role: Role): void {
    const newName = prompt('Enter new role name:', role.roleName);
    if (!newName?.trim()) return;
    this.roleService.updateRole(role.id, { roleName: newName.trim() }).subscribe({
      next: () => this.fetchRoles(),
      error: (err) => console.error('Error updating role:', err)
    });
  }

  deleteRole(id: number): void {
    if (!confirm('Are you sure you want to delete this role?')) return;
    this.roleService.deleteRole(id).subscribe({
      next: () => this.fetchRoles(),
      error: (err) => console.error('Error deleting role:', err)
    });
  }

  canAddUser(): boolean {
    return true;
  }

  openForm(): void {
    this.router.navigate(['/users/add']);
  }
}