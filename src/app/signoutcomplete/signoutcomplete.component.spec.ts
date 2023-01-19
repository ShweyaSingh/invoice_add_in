import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoutcompleteComponent } from './signoutcomplete.component';

describe('SignoutcompleteComponent', () => {
  let component: SignoutcompleteComponent;
  let fixture: ComponentFixture<SignoutcompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignoutcompleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignoutcompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
