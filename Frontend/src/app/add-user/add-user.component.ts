import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Role {
  id: number;
  roleName: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role_id: number;
  avatarUrl?: string | null;
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'] // make sure this file exists
})
export class AddUserComponent implements OnInit {
  roles: Role[] = [];
  user: User = { name: '', email: '', role_id: 0, avatarUrl: null };
  isEditMode = false;
  private api = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadUserById(+id);
    }
  }

  loadRoles(): void {
    this.http.get<Role[]>(`${this.api}/roles`).subscribe({
      next: (res) => {
        this.roles = res;
        if (!this.user.role_id && this.roles.length > 0) {
          this.user.role_id = this.roles[0].id;
        }
      },
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  loadUserById(id: number): void {
    this.http.get<User>(`${this.api}/users/${id}`).subscribe({
      next: (res) => {
        this.user = {
          id: res.id,
          name: res.name,
          email: res.email,
          role_id: res.role_id,
          avatarUrl: res.avatarUrl || null
        };
      },
      error: (err) => console.error('Error loading user:', err)
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    this.http.post<{ imageUrl: string }>(`${this.api}/upload`, formData).subscribe({
      next: (res) => {
        this.user.avatarUrl = `http://localhost:3000${res.imageUrl}`;
      },
      error: (err) => console.error('Upload error:', err)
    });
  }

  onSubmit(): void {
    if (!this.user.name || !this.user.email || !this.user.role_id) {
      alert('All fields are required');
      return;
    }

    if (this.isEditMode && this.user.id) {
      // UPDATE
      this.http.put(`${this.api}/users/${this.user.id}`, this.user).subscribe({
        next: () => {
          alert('User updated successfully');
          this.router.navigate(['/manage-admin']);
        },
        error: (err) => {
          console.error(err);
          alert('Error updating user');
        }
      });
    } else {
      // CREATE
      this.http.post(`${this.api}/users`, this.user).subscribe({
        next: () => {
          alert('User added successfully');
          this.router.navigate(['/manage-admin']);
        },
        error: (err) => {
          console.error(err);
          alert('Error saving user');
        }
      });
    }
  }
}