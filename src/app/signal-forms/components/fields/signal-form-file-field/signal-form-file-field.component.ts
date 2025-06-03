import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { type RuntimeFileSignalField } from '@models/signal-field-types.model';
import { SignalModelDirective } from '../../../directives/signal-model.directive';

@Component({
  selector: 'signal-form-file-field',
  standalone: true,
  imports: [SignalModelDirective],
  templateUrl: './signal-form-file-field.component.html',
  styleUrl: './signal-form-file-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class SignalFormFileFieldComponent<
  TModel extends object,
  K extends keyof TModel = keyof TModel,
> extends BaseInputDirective<RuntimeFileSignalField<TModel, K>, TModel, K> {
  protected isDragging = signal(false);
  protected uploadProgress = signal<number | null>(null);
  protected imagePreview = signal<string | null>(null);

  private maxSizeBytes = computed(
    () => (this.field().config?.maxSizeMb ?? 5) * 1024 * 1024,
  );

  protected isImageFile = computed(() => {
    const file = this.field().value() as File;
    return file && file.type.startsWith('image/');
  });

  protected fileName = computed(() => {
    const file = this.field().value() as File;
    return file?.name || '';
  });

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
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

    this.field().error.set('');
    this.setValue(file as TModel[K]);
    this.uploadProgress.set(0);
    this.simulateUpload(file);
    this.field().touched.set(true);

    if (file.type.startsWith('image/')) {
      this.createImagePreview(file);
    } else {
      this.imagePreview.set(null);
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  private simulateUpload(file: File) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress.set(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.uploadProgress.set(null);
      }
    }, 100);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      this.onFileChange(fakeEvent);
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

  public removeFile(): void {
    this.setValue(null as TModel[K]);
    this.imagePreview.set(null);
    this.field().touched.set(true);
  }
}
