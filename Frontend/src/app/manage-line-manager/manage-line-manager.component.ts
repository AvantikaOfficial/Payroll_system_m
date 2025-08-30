import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RolePermissionService } from '../Services/RolePermissionServices/role-permission.service';
import { Role } from '../manage-admin/manage-admin.component';

@Component({
  selector: 'app-manage-line-manager',
  templateUrl: './manage-line-manager.component.html',
  styleUrls: ['./manage-line-manager.component.scss']
})
export class ManageLineManagerComponent implements OnInit {
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