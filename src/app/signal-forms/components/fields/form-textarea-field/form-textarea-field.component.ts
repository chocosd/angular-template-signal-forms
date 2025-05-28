import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeTextAreaSignalField } from '../../../models/signal-field-types.model';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-textarea-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-textarea-field.component.html',
  styleUrl: './form-textarea-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTextareaFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimeTextAreaSignalField<TModel, K>,
  TModel,
  K
> {}
