import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobiusViewerComponent } from './mobius-viewer.component';

describe('MobiusViewerComponent', () => {
  let component: MobiusViewerComponent;
  let fixture: ComponentFixture<MobiusViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobiusViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobiusViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
