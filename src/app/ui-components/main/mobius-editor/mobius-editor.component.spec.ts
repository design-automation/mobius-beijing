import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobiusEditorComponent } from './mobius-editor.component';

describe('MobiusEditorComponent', () => {
  let component: MobiusEditorComponent;
  let fixture: ComponentFixture<MobiusEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobiusEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobiusEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
