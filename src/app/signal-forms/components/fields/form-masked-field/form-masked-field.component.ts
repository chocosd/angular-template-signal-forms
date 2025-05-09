import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { MaskedFieldConfig } from '@models/signal-field-configs.model';
import { MaskParser } from 'app/signal-forms/helpers/mask-parser';
import { FormFieldType } from '../../../enums/form-field-type.enum';
import { BaseInputDirective } from '../../base/base-input/base-input.directive';

@Component({
  selector: 'signal-form-masked-field',
  standalone: true,
  templateUrl: './form-masked-field.component.html',
  styleUrl: './form-masked-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormMaskedFieldComponent extends BaseInputDirective<
  FormFieldType.MASKED,
  string,
  MaskedFieldConfig
> {
  private inputRef = viewChild('maskedInput', { read: ElementRef });

  private readonly mask = computed(() => this.config()?.mask ?? '');
  private lastCaretPos = 0;

  constructor() {
    super();
    this.initializeEffect();
  }

  private initializeEffect() {
    effect(() => {
      if (!this.mask() || this.value()) return;

      const initial = MaskParser.format('', this.mask());
      this.setValue(initial);
    });
  }

  public onInput(event: Event): void {
    const el = this.inputRef()?.nativeElement;
    const rawValue = el.value;
    const caret = el.selectionStart ?? 0;

    const masked = MaskParser.format(rawValue, this.mask());
    this.setValue(masked);

    this.dirty.set(true);
    this.lastCaretPos = MaskParser.getNextEditableIndex(this.mask(), caret);
    this.moveCaret(this.lastCaretPos);
  }

  public onKeyDown(event: KeyboardEvent): void {
    const el = this.inputRef()?.nativeElement;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    const key = event.key;

    const hasSelection = end > start;

    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();

      const mask = this.mask();
      let updated = this.value() ?? '';

      const editableIndices = MaskParser.getEditableIndices(mask);

      const range = hasSelection ? [start, end] : [start - 1, start];
      const charsToClear = editableIndices.filter(
        (i) => i >= range[0] && i < range[1],
      );

      for (const idx of charsToClear) {
        updated = updated.substring(0, idx) + '_' + updated.substring(idx + 1);
      }

      this.setValue(updated);
      this.dirty.set(true);

      const caretAfter = MaskParser.getNextEditableIndex(mask, range[0]);
      this.moveCaret(caretAfter);
    }

    // Prevent invalid char input
    if (key.length === 1 && !this.isValidChar(key, start)) {
      event.preventDefault();
    }
  }

  private isValidChar(char: string, pos: number): boolean {
    const defs = MaskParser.DEFAULT_MASK_DEFINITION;
    const token = this.mask()[pos];
    const def = defs[token as keyof typeof defs];
    return !!def?.test(char);
  }

  private removeCharAt(pos: number): void {
    const current = this.value() ?? '';
    const maskChar = this.mask()[pos];
    if (
      !MaskParser.DEFAULT_MASK_DEFINITION[
        maskChar as keyof typeof MaskParser.DEFAULT_MASK_DEFINITION
      ]
    )
      return;

    const updated =
      current.substring(0, pos) + '_' + current.substring(pos + 1);
    this.setValue(updated);
    this.dirty.set(true);
  }

  private moveCaret(pos: number): void {
    requestAnimationFrame(() => {
      this.inputRef()?.nativeElement.setSelectionRange(pos, pos);
    });
  }
}
