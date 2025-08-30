import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  // 👉 Password show/hide
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
onLogin() {
  const userData = { email: this.email, password: this.password };

  this.http.post<any>('http://localhost:3000/login', userData).subscribe({
    next: (res) => {
      if (res.success) {
  localStorage.setItem('user', JSON.stringify(res.user)); 
  this.router.navigate(['/dashboard']);
}
else {
        alert(res.message || 'Invalid credentials');
      }
    },
    error: (err) => {
      console.error(err);
      alert('Login failed');
    }
  });
}

}