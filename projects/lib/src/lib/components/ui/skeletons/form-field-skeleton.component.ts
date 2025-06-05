import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Base skeleton component for form fields
 */
@Component({
  selector: 'form-field-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field-skeleton.component.html',
  styleUrl: './form-field-skeleton.component.scss',
})
export class FormFieldSkeletonComponent {
  /**
   * The field name for accessibility
   */
  public name = input<string>('field');

  /**
   * The type of skeleton to render
   */
  public skeletonType = input<
    | 'input'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio-group'
    | 'multiselect'
    | 'rating'
    | 'slider'
    | 'file'
  >('input');

  /**
   * Whether this is a checkbox field (affects label positioning)
   */
  public isCheckbox = input<boolean>(false);
}
