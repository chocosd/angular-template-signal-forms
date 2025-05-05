import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
} from '@angular/core';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '../../../models/signal-form.model';
import { CollapsibleSectionComponent } from '../../ui/collapsible-section/collapsible-section.component';
import { SignalFormInputItemComponent } from '../signal-form-input-item/signal-form-input-item.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-fields',
  imports: [
    SignalFormInputItemComponent,
    NgTemplateOutlet,
    CollapsibleSectionComponent,
  ],
  standalone: true,
  templateUrl: './signal-form-fields.component.html',
  styleUrl: './signal-form-fields.component.scss',
})
export class SignalFormFieldsComponent<TModel> {
  public fields = input.required<SignalFormField<TModel>[]>();
  public form = input.required<SignalFormContainer<TModel>>();

  protected visibleFields = computed<SignalFormField<TModel>[] | undefined>(
    () => {
      return this.fields().filter((f) => {
        const hidden = f.hidden;
        return !(typeof hidden === 'function'
          ? hidden(this.form()!)
          : !!hidden);
      });
    },
  );

  protected formLayoutClass = computed(() => {
    const view = this.form()?.config?.view ?? 'stacked';
    return view === 'row' ? 'form-group-row' : 'form-group-stacked';
  });

  @HostBinding('class')
  public get hostClass(): string {
    return this.formLayoutClass();
  }
}
