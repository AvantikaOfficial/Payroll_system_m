import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { DepartmentComponent } from './department/department.component';
import { LeavesComponent } from './leaves/leaves.component';
import { SalaryComponent } from './salary/salary.component';
import { LoginComponent } from './login/login.component';
import { ChartApexComponent } from './charts/chart-apex/chart-apex.component';
import { ReportCalendarComponent } from './report-calendar/report-calendar.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { TeamReportComponent } from './reports/team-report/team-report.component';
import { LeaveReportComponent } from './reports/leave-report/leave-report.component';
import { PayrollReportComponent } from './reports/payroll-report/payroll-report.component';
import { SecurityReportComponent } from './reports/security-report/security-report.component';
import { WorkFromHomeReportComponent } from './reports/work-from-home-report/work-from-home-report.component';
import { ContactReportComponent } from './reports/contact-report/contact-report.component';
import { CalendarComponent } from './application/calendar/calendar.component';
import { ChatComponent } from './application/chat/chat.component';
import { NotesComponent } from './application/notes/notes.component';
import { ForgotPasswordComponent } from './profile/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './profile/reset-password/reset-password.component';
import { LockScreenComponent } from './profile/lock-screen/lock-screen.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { AddDepartmentComponent } from './add-department/add-department.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { RegisterComponent } from './register/register.component';
import { EmployeesGridComponent } from './employees-grid/employees-grid.component';
import { EmployeeTeamComponent } from './employee-team/employee-team.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { LeaveTypesComponent } from './leave-types/leave-types.component';
import { ManageComponent } from './manage/manage.component';
import { ManageAdminComponent } from './manage-admin/manage-admin.component';
import { ManageLineManagerComponent } from './manage-line-manager/manage-line-manager.component';
import { ManageSuperAdminComponent } from './manage-super-admin/manage-super-admin.component';
import { AddUserComponent } from './add-user/add-user.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path:'register', component: RegisterComponent
  },

  // Employees
  { path: 'employees', component: EmployeesComponent },
  { path: 'add-employee', component: AddEmployeeComponent },
  { path: 'add-employee/:id', component: AddEmployeeComponent },
    { path: 'employees-grid', component: EmployeesGridComponent },
    { path:'employee-team', component: EmployeeTeamComponent },
    { path:'employee-details', component: EmployeeDetailsComponent},
     { path: 'employee-details/:id', component: EmployeeDetailsComponent },

  // Departments
  { path: 'departments', component: DepartmentComponent },
  { path: 'add-department', component: AddDepartmentComponent },
    { path: 'add-department/:id', component: AddDepartmentComponent },

  // Others
  { path: 'leaves', component: LeavesComponent },
  { path: 'leave-types', component: LeaveTypesComponent },
  { path: 'salary', component: SalaryComponent },
  { path: 'charts/apex', component: ChartApexComponent },
  { path: 'report-calendar', component: ReportCalendarComponent },
  { path: 'nav-bar', component: NavBarComponent },

  // Reports
  {
    path: 'reports',
    children: [
      { path: '', redirectTo: 'team-report', pathMatch: 'full' },
      { path: 'team-report', component: TeamReportComponent },
      { path: 'leave-report', component: LeaveReportComponent },
      { path: 'payroll-report', component: PayrollReportComponent },
      { path: 'security-report', component: SecurityReportComponent },
      { path: 'work-from-home-report', component: WorkFromHomeReportComponent },
      { path: 'contact-report', component: ContactReportComponent },
    ]
  },

  // Applications
  {
    path: 'application',
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: 'calendar', component: CalendarComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'notes', component: NotesComponent },
    ]
  },

  // Profile
  {
    path: 'profile',
    children: [
      { path: '', redirectTo: 'forgot-password', pathMatch: 'full' },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'lock-screen', component: LockScreenComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  },

  // Manage
  { path: 'manage', component: ManageComponent},
  { path: 'manage-admin', component: ManageAdminComponent },
  { path: 'manage-line-manager', component: ManageLineManagerComponent },
  { path: 'manage-super-admin', component: ManageSuperAdminComponent},
  { path: 'add-user', component: AddUserComponent },
  { path: 'users', component: ManageComponent }, // your users list page
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users/add', component: AddUserComponent },          // add mode
  { path: 'users/edit/:id', component: AddUserComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
