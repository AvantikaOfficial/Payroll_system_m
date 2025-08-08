import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactReportComponent } from './contact-report.component';

describe('ContactReportComponent', () => {
  let component: ContactReportComponent;
  let fixture: ComponentFixture<ContactReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactReportComponent]
    });
    fixture = TestBed.createComponent(ContactReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
