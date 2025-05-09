import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { BaseInputDirective } from '@base/base-input/base-input.directive';
import { SignalFormHostDirective } from '@base/host-directive/signal-form-host.directive';
import { FormFieldType } from '@enums/form-field-type.enum';
import { FileFieldConfig } from '@models/signal-field-configs.model';

@Component({
  selector: 'signal-form-file-field',
  standalone: true,
  templateUrl: './form-file-field.component.html',
  styleUrl: './form-file-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [SignalFormHostDirective],
})
export class FormFileFieldComponent extends BaseInputDirective<
  FormFieldType.FILE,
  File | null,
  FileFieldConfig
> {
  protected isDragging = signal(false);
  protected uploadProgress = signal<number | null>(null);

  private maxSizeBytes = computed(
    () => (this.config()?.maxSizeMb ?? 5) * 1024 * 1024,
  );

  public onFileChange(event: File): void {
    console.log(event);

    const file = (event as any).target.files?.[0];
    if (!file) {
      return;
    }

    const maxSize = this.maxSizeBytes();
    if (file.size > maxSize) {
      this.error.set(
        `File exceeds max size of ${this.config()?.maxSizeMb ?? 5}MB`,
      );
      return;
    }

    this.setValue(file);
    this.uploadProgress.set(0);
    this.simulateUpload(file);
    this.touched.set(true);
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
