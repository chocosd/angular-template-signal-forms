import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseInputDirective } from '../../../components/base/base-input/base-input.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { type RuntimePasswordSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-password-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-password-field.component.html',
  styleUrl: './signal-form-password-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormPasswordFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<
  RuntimePasswordSignalField<TModel, K>,
  TModel,
  K
> {}
