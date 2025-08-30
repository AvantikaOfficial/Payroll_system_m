export interface SalaryTransaction {
  id: number;
  employeeId: number;   // <-- add this
  employee: string;
  basic: number;
  hra: number;
  total: number;
  status: string;
  date: string;
  forMonth?: string;
  created_at: string;  
}
export interface SalarySummary {
  totalEmployees: number;
  totalPaid: number;
  totalPending: number;
  totalAmount: number;
}
export interface SalaryReport {
  month: string;
  totalPaid: number;
  totalPending: number;
  totalAmount: number;
}
export interface SalarySlip {
  employeeName: string;
  employeeId: number;
  designation: string;
  department: string;
  payPeriod: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  dateOfPayment: string;
}
export interface SalaryFilter {
  month?: string;
  year?: number;
  status?: string;
  employeeId?: number; // <-- add this
}
export interface SalaryPayment {
  employeeId: number;
  month: string;
  year: number;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paymentDate: string;
}
