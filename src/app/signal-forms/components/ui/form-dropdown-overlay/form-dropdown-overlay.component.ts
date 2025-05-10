import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  Injector,
  input,
  OnInit,
  output,
  Renderer2,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type FormOption } from '@models/signal-form.model';
import { CheckIcon, LucideAngularModule } from 'lucide-angular';
import { fromEvent, tap } from 'rxjs';

@Component({
  selector: 'form-dropdown-overlay',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './form-dropdown-overlay.component.html',
  styleUrl: './form-dropdown-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDropdownOverlayComponent implements OnInit {
  public options = input.required<FormOption[]>();
  public multiselect = input<boolean>(false);
  public triggerElement = input<HTMLElement>();
  public initialSelection = input<FormOption[] | FormOption>();
  public ariaListboxId = input.required<string>();

  public select = output<FormOption | FormOption[] | null>();
  public close = output<void>();

  public optionElements = viewChildren('optionElement', { read: ElementRef });

  protected focusedIndex = signal<number>(-1);
  protected selectedOptions = signal<FormOption[]>([]);

  protected readonly checkIcon = CheckIcon;

  constructor(
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef,
    private readonly destroyRef: DestroyRef,
    private readonly injector: Injector,
  ) {}

  public ngOnInit(): void {
    this.handleSingleOrMultiSelect();
    this.listenToDocumentMouseClicks();
    this.listenToTriggerElementKeyDown();
    this.listenToOptionElementForView();
  }

  private handleSingleOrMultiSelect(): void {
    const selection = this.initialSelection();

    if (!selection) {
      return;
    }

    if (this.multiselect() && Array.isArray(selection)) {
      this.selectedOptions.set(selection);
      return;
    }

    this.selectedOptions.set([selection as FormOption]);
  }

  public selectOption(option: FormOption): void {
    if (this.multiselect()) {
      const current = (this.selectedOptions() as FormOption[]) ?? [];
      const exists = current.some((o) => o.value === option.value);
      const updated = exists
        ? current.filter((o) => o.value !== option.value)
        : [...current, option];

      this.selectedOptions.set(updated);
      this.select.emit(updated);
    } else {
      this.selectedOptions.set([option]);
      this.emitSelection();
    }
  }

  private emitSelection(): void {
    const result = this.multiselect()
      ? this.selectedOptions()
      : (this.selectedOptions()[0] ?? null);

    this.select.emit(result);
  }

  public toggleOption(option: FormOption): void {
    if (this.multiselect()) {
      this.selectedOptions.update((current) => {
        const exists = current.some((o) => o.value === option.value);
        return exists
          ? current.filter((o) => o.value !== option.value)
          : [...current, option];
      });
    } else {
      this.selectedOptions.set([option]);
      this.emitSelection();
    }
  }

  public setPosition({
    top,
    left,
    width,
  }: {
    top: number;
    left: number;
    width: number;
  }): void {
    const el = this.elementRef.nativeElement;

    Object.entries({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      zIndex: 1000,
    }).forEach(([key, val]) => this.renderer.setStyle(el, key, val));
  }

  protected isSelected(formOption: FormOption): boolean {
    const selectedOptions = this.selectedOptions();

    if (!this.selectedOptions()) {
      return false;
    }
    return selectedOptions.some((option) => option.value === formOption.value);
  }

  private listenToDocumentMouseClicks(): void {
    fromEvent<MouseEvent>(document, 'click')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const target = event.target as Node;

        const clickedInsideOverlay =
          this.elementRef.nativeElement.contains(target);
        const clickedOnTrigger = this.triggerElement()?.contains(target);

        if (!clickedInsideOverlay && !clickedOnTrigger) {
          this.close.emit();
        }
      });
  }

  private listenToTriggerElementKeyDown(): void {
    if (!this.triggerElement()) {
      return;
    }

    fromEvent<KeyboardEvent>(this.triggerElement()!, 'keydown')
      .pipe(
        tap((event) => this.handleKeydown(event)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private handleKeydown(event: KeyboardEvent): void {
    const options = this.options();
    const max = options.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update((i) => (i + 1 > max ? 0 : i + 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update((i) => (i - 1 < 0 ? max : i - 1));
        break;

      case 'Enter':
        event.preventDefault();
        const selected = options[this.focusedIndex()];
        if (selected) this.selectOption(selected);
        break;

      case 'Escape':
        this.close.emit();
        break;
    }
  }

  private listenToOptionElementForView(): void {
    effect(
      () => {
        const index = this.focusedIndex();

        if (index === -1) {
          return;
        }

        const el = this.optionElements().at(index)?.nativeElement;

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      },
      {
        injector: this.injector,
      },
    );
  }
}
