import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
} from '@angular/core';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '../../../models/signal-form.model';
import { SignalFormInputItemComponent } from '../signal-form-input-item/signal-form-input-item.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-fields',
  imports: [SignalFormInputItemComponent],
  standalone: true,
  templateUrl: './signal-form-fields.component.html',
  styleUrl: './signal-form-fields.component.scss',
})
export class SignalFormFieldsComponent<TModel> {
  public fields = input.required<SignalFormField<TModel>[]>();
  public form = input.required<SignalFormContainer<TModel>>();

  protected visibleFields = computed<SignalFormField<TModel>[]>(() => {
    return this.fields().filter((f) => {
      const hide = f.hide;
      return !(typeof hide === 'function' ? hide(this.form()) : !!hide);
    });
  });

  constructor() {
    effect(() => console.log(this.fields()));
  }
}
