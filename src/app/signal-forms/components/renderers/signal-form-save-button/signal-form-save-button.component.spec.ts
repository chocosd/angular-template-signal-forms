import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalFormSaveButtonComponent } from './signal-form-save-button.component';

describe('SignalFormSaveButtonComponent', () => {
  let component: SignalFormSaveButtonComponent<unknown>;
  let fixture: ComponentFixture<SignalFormSaveButtonComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormSaveButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalFormSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
