import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeTextSignalField } from '../../../models/signal-field-types.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-text-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: 'form-text-field.component.html',
})
export class FormTextFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeTextSignalField<TModel, K>, TModel, K> {}
