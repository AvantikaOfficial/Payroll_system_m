import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTeamComponent } from './employee-team.component';

describe('EmployeeTeamComponent', () => {
  let component: EmployeeTeamComponent;
  let fixture: ComponentFixture<EmployeeTeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeTeamComponent]
    });
    fixture = TestBed.createComponent(EmployeeTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
