import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { MaskParser } from 'app/signal-forms/helpers/mask-parser';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeMaskedSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-masked-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-masked-field.component.html',
  styleUrl: './form-masked-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormMaskedFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeMaskedSignalField<TModel, K>, TModel, K> {
  private inputRef = viewChild('maskedInput', { read: ElementRef });

  private readonly mask = computed(() => this.field().config?.mask ?? '');
  private lastCaretPos = 0;

  constructor() {
    super();
    this.initializeEffect();
  }

  private initializeEffect() {
    effect(() => {
      if (!this.mask() || this.field().value()) return;

      const initial = MaskParser.format('', this.mask());
      this.setValue(initial as TModel[K]);
    });
  }

  public onInput(event: Event): void {
    const el = this.inputRef()?.nativeElement;
    const rawValue = el.value;
    const caret = el.selectionStart ?? 0;

    const masked = MaskParser.format(rawValue, this.mask());
    this.setValue(masked as TModel[K]);

    this.field().dirty.set(true);
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
      let updated = this.field().value() ?? '';

      const editableIndices = MaskParser.getEditableIndices(mask);

      const range = hasSelection ? [start, end] : [start - 1, start];
      const charsToClear = editableIndices.filter(
        (i) => i >= range[0] && i < range[1],
      );

      for (const idx of charsToClear) {
        updated =
          (updated as string).substring(0, idx) +
          '_' +
          (updated as string).substring(idx + 1);
      }

      this.setValue(updated as TModel[K]);
      this.field().dirty.set(true);

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
    const current = this.field().value() ?? '';
    const maskChar = this.mask()[pos];
    if (
      !MaskParser.DEFAULT_MASK_DEFINITION[
        maskChar as keyof typeof MaskParser.DEFAULT_MASK_DEFINITION
      ]
    )
      return;
    const updated =
      (current as string).substring(0, pos) +
      '_' +
      (current as string).substring(pos + 1);
    this.setValue(updated as TModel[K]);
    this.field().dirty.set(true);
  }

  private moveCaret(pos: number): void {
    requestAnimationFrame(() => {
      this.inputRef()?.nativeElement.setSelectionRange(pos, pos);
    });
  }
}
