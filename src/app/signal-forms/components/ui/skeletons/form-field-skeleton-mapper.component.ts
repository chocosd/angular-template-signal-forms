import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { FormFieldSkeletonComponent } from './form-field-skeleton.component';

/**
 * Maps form field types to appropriate skeleton UI
 */
@Component({
  selector: 'form-field-skeleton-mapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldSkeletonComponent],
  template: `
    <form-field-skeleton
      [name]="fieldName()"
      [skeletonType]="skeletonType()"
      [isCheckbox]="isCheckboxType()"
    />
  `,
})
export class FormFieldSkeletonMapperComponent {
  /**
   * The form field type to create skeleton for
   */
  public fieldType = input.required<FormFieldType>();

  /**
   * The field name for accessibility
   */
  public fieldName = input<string>('field');

  /**
   * Computed skeleton type based on field type
   */
  protected skeletonType = computed(() => {
    const type = this.fieldType();

    switch (type) {
      case FormFieldType.TEXT:
      case FormFieldType.PASSWORD:
      case FormFieldType.NUMBER:
      case FormFieldType.COLOR:
      case FormFieldType.DATETIME:
        return 'input';

      case FormFieldType.TEXTAREA:
        return 'textarea';

      case FormFieldType.SELECT:
      case FormFieldType.AUTOCOMPLETE:
        return 'select';

      case FormFieldType.CHECKBOX:
        return 'checkbox';

      case FormFieldType.CHECKBOX_GROUP:
      case FormFieldType.RADIO:
        return 'radio-group';

      case FormFieldType.MULTISELECT:
      case FormFieldType.CHIPLIST:
        return 'multiselect';

      case FormFieldType.RATING:
        return 'rating';

      case FormFieldType.SLIDER:
        return 'slider';

      case FormFieldType.FILE:
        return 'file';

      case FormFieldType.SWITCH:
        return 'checkbox';

      default:
        return 'input';
    }
  });

  /**
   * Whether this is a checkbox-style field
   */
  protected isCheckboxType = computed(() => {
    const type = this.fieldType();
    return type === FormFieldType.CHECKBOX || type === FormFieldType.SWITCH;
  });
}
