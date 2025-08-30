import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSuperAdminComponent } from './manage-super-admin.component';

describe('ManageSuperAdminComponent', () => {
  let component: ManageSuperAdminComponent;
  let fixture: ComponentFixture<ManageSuperAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageSuperAdminComponent]
    });
    fixture = TestBed.createComponent(ManageSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
