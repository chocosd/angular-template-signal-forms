import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
} from '@angular/core';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { SignalFormRepeatableFieldComponent } from '@fields/signal-form-repeatable-field/signal-form-repeatable-field.component';
import {
  type GridSignalFormConfig,
  type SignalFormConfig,
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';
import { CollapsibleSectionComponent } from '@ui/collapsible-section/collapsible-section.component';
import { SignalFormInputItemComponent } from '../signal-form-input-item/signal-form-input-item.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'signal-form-fields',
  imports: [
    SignalFormInputItemComponent,
    NgTemplateOutlet,
    CollapsibleSectionComponent,
    SignalFormRepeatableFieldComponent,
  ],
  standalone: true,
  templateUrl: './signal-form-fields.component.html',
  styleUrl: './signal-form-fields.component.scss',
  hostDirectives: [SignalFormHostDirective],
  host: {
    '[style.grid-template-areas]': 'gridTemplateAreas()',
    '[class.grid]': 'isGridLayout()',
  },
})
export class SignalFormFieldsComponent<TModel> {
  public fields = input.required<SignalFormField<TModel>[]>();
  public form = input.required<SignalFormContainer<TModel>>();
  public index = input<number | null>(null);
  public isRoot = input<boolean>(true);
  public signalFormParent = input<boolean>(false);

  protected readonly formFieldType = FormFieldType;

  protected visibleFields = computed<SignalFormField<TModel>[] | undefined>(
    () => this.fields().filter((f) => !f.isHidden?.()),
  );

  private isGridAreaConfig(
    config: SignalFormConfig<TModel>,
  ): config is GridSignalFormConfig<TModel> {
    if (!config) {
      return false;
    }

    return config?.layout === 'grid-area' || 'gridArea' in config;
  }

  protected gridTemplateAreas = computed(() => {
    const config = this.form().config;

    if (!this.isGridAreaConfig(config)) {
      return null;
    }

    return config?.gridArea.map((row) => `"${row.join(' ')}"`).join(' ');
  });

  protected isGridLayout(): boolean {
    return this.isGridAreaConfig(this.form().config);
  }

  protected formLayoutClass = computed(() => {
    switch (this.form()?.config?.view) {
      case 'collapsable':
        return 'form-group-collapsable';
      case 'row':
        return 'form-group-row';
      default:
        return 'form-group-stacked';
    }
  });

  @HostBinding('class')
  public get hostClass(): string {
    return this.formLayoutClass();
  }
}
