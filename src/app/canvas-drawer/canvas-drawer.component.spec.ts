import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDrawerComponent } from './canvas-drawer.component';

describe('CanvasDrawerComponent', () => {
  let component: CanvasDrawerComponent;
  let fixture: ComponentFixture<CanvasDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasDrawerComponent]
    });
    fixture = TestBed.createComponent(CanvasDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
