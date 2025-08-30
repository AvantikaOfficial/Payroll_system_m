import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLineManagerComponent } from './manage-line-manager.component';

describe('ManageLineManagerComponent', () => {
  let component: ManageLineManagerComponent;
  let fixture: ComponentFixture<ManageLineManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageLineManagerComponent]
    });
    fixture = TestBed.createComponent(ManageLineManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
