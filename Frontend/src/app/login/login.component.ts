import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.email === 'admin@example.com' && this.password === 'admin123') {
      // Redirect to dashboard (update this route as per your routing)
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
}
