import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  SignalFormField,
  type SignalFormContainer,
} from '@models/signal-form.model';
import { SignalFormInputItemComponent } from '@renderers/signal-form-input-item/signal-form-input-item.component';
import {
  LucideAngularModule,
  MinusCircleIcon,
  PlusCircleIcon,
} from 'lucide-angular';

@Component({
  selector: 'signal-form-repeatable-field',
  standalone: true,
  imports: [SignalFormInputItemComponent, LucideAngularModule],
  templateUrl: './form-repeatable-field.component.html',
  styleUrl: './form-repeatable-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRepeatableFieldComponent<TModel> {
  public repeatableForms = input.required<SignalFormContainer<unknown>[]>();
  public heading = input<string>('');
  public fields = input.required<SignalFormField<TModel>[]>();

  public addItem = output<void>();
  public removeItem = output<number>();

  protected formsList = computed(() => this.repeatableForms());
  protected readonly plus = PlusCircleIcon;
  protected readonly minus = MinusCircleIcon;
}
