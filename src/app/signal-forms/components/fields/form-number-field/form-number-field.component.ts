import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeNumberSignalField } from '../../../models/signal-field-types.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-number-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-number-field.component.html',
})
export class FormNumberFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeNumberSignalField<TModel, K>, TModel, K> {
  constructor() {
    super();

    effect(() => {
      console.log(`${String(this.field().name)}`, this.field().isDisabled());
    });
  }
}
