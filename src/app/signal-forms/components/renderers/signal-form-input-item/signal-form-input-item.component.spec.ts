import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalFormInputItemComponent } from './signal-form-input-item.component';

describe('AppFormInputItemComponent', () => {
  let component: SignalFormInputItemComponent<unknown>;
  let fixture: ComponentFixture<SignalFormInputItemComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalFormInputItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalFormInputItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
