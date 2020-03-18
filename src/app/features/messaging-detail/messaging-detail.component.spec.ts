import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MessagingDetailComponent } from "./messaging-detail.component";

describe("MessagingDetailComponent", () => {
  let component: MessagingDetailComponent;
  let fixture: ComponentFixture<MessagingDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessagingDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
