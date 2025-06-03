import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RuntimeTextAreaSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';
import { WordCountComponent } from '../../ui/word-count/word-count.component';

@Component({
  selector: 'signal-form-textarea-field',
  standalone: true,
  imports: [SignalModelDirective, WordCountComponent],
  templateUrl: './signal-form-textarea-field.component.html',
  styleUrl: './signal-form-textarea-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormTextareaFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimeTextAreaSignalField<TModel, K>,
  TModel,
  K
> {}
