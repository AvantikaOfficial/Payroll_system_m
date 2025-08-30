import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  showPassword = false;

  constructor(private http: HttpClient) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onRegister() {
    if (this.user.password !== this.user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    this.http.post('http://localhost:3000/register', this.user).subscribe({
      next: (res) => {
        console.log('User registered:', res);
        alert("Registration successful!");
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert("Something went wrong!");
      }
    });
  }
}