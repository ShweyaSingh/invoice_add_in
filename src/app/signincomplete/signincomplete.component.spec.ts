import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignincompleteComponent } from './signincomplete.component';

describe('SignincompleteComponent', () => {
  let component: SignincompleteComponent;
  let fixture: ComponentFixture<SignincompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignincompleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignincompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
