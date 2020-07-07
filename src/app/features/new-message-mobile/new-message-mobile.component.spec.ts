import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessageMobileComponent } from './new-message-mobile.component';

describe('NewMessageMobileComponent', () => {
  let component: NewMessageMobileComponent;
  let fixture: ComponentFixture<NewMessageMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMessageMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMessageMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
