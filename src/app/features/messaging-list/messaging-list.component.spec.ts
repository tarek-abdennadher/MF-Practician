import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagingListComponent } from './messaging-list.component';

describe('MessagingListComponent', () => {
  let component: MessagingListComponent;
  let fixture: ComponentFixture<MessagingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
