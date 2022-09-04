import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryeditComponent } from './inventoryedit.component';

describe('InventoryeditComponent', () => {
  let component: InventoryeditComponent;
  let fixture: ComponentFixture<InventoryeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryeditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
