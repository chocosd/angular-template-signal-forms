import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  LucideAngularModule,
  MinusCircleIcon,
  PlusCircleIcon,
} from 'lucide-angular';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '../../../models/signal-form.model';
import { SignalFormInputItemComponent } from '../../renderers/signal-form-input-item/signal-form-input-item.component';

@Component({
  selector: 'signal-form-repeatable-field',
  standalone: true,
  imports: [SignalFormInputItemComponent, LucideAngularModule],
  templateUrl: './signal-form-repeatable-field.component.html',
  styleUrl: './signal-form-repeatable-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormRepeatableFieldComponent<TModel> {
  public repeatableForms = input.required<SignalFormContainer<unknown>[]>();
  public heading = input<string>('');
  public fields = input.required<SignalFormField<TModel>[]>();

  public addItem = output<void>();
  public removeItem = output<number>();

  protected formsList = computed(() => this.repeatableForms());
  protected readonly plus = PlusCircleIcon;
  protected readonly minus = MinusCircleIcon;
}
