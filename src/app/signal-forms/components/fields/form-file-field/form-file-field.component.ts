import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { SignalModelDirective } from '../../../directives/signal-model.directive';
import { RuntimeFileSignalField } from '../../../models/signal-field-types.model';

@Component({
  selector: 'signal-form-file-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './form-file-field.component.html',
  styleUrl: './form-file-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class FormFileFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeFileSignalField<TModel, K>, TModel, K> {
  protected isDragging = signal(false);
  protected uploadProgress = signal<number | null>(null);

  private maxSizeBytes = computed(
    () => (this.field().config?.maxSizeMb ?? 5) * 1024 * 1024,
  );

  public onFileChange(event: File): void {
    const file = (event as any).target.files?.[0];
    if (!file) {
      return;
    }

    const maxSize = this.maxSizeBytes();
    if (file.size > maxSize) {
      this.field().error.set(
        `File exceeds max size of ${this.field().config?.maxSizeMb ?? 5}MB`,
      );
      return;
    }

    this.setValue(file as TModel[K]);
    this.uploadProgress.set(0);
    this.simulateUpload(file);
    this.field().touched.set(true);
  }

  private simulateUpload(file: File) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress.set(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.uploadProgress.set(null); // Upload complete
      }
    }, 100);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.onFileChange(file);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  public onDragLeave(): void {
    this.isDragging.set(false);
  }

  public openFileDialog(input: HTMLInputElement): void {
    input.click();
  }
}
