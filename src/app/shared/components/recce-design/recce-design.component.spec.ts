import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecceDesignComponent } from './recce-design.component';

describe('RecceDesignComponent', () => {
  let component: RecceDesignComponent;
  let fixture: ComponentFixture<RecceDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecceDesignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecceDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
