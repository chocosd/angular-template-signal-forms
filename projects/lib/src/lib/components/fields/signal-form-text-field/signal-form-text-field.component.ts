import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimeTextSignalField } from '../../../models/signal-field-types.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';
import { WordCountComponent } from '../../ui/word-count/word-count.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-text-field',
  standalone: true,
  imports: [SignalModelDirective, WordCountComponent],
  templateUrl: 'signal-form-text-field.component.html',
})
export class SignalFormTextFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeTextSignalField<TModel, K>, TModel, K> {}
