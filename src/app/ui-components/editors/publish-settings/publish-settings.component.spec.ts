import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishSettingsComponent } from './publish-settings.component';

describe('PublishSettingsComponent', () => {
  let component: PublishSettingsComponent;
  let fixture: ComponentFixture<PublishSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublishSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
