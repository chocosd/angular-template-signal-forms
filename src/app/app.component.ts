import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ExampleSignalFormRowsComponent } from './examples/example-signal-form-rows/example-signal-form-rows.component';
import { ExampleSignalFormStepperComponent } from './examples/example-signal-form-stepper/example-signal-form-stepper.component';
import { ExampleSignalFormComponent } from './examples/example-signal-form/example-signal-form.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    ExampleSignalFormComponent,
    ExampleSignalFormRowsComponent,
    ExampleSignalFormStepperComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'signal-template-forms';

  protected actions = [
    {
      action: () => this.showForm(),
      label: 'show form',
    },
    {
      action: () => this.showModalStepper(),
      label: 'show stepper form',
    },
    {
      action: () => this.showFormRows(),
      label: 'show form rows',
    },
  ];

  protected view = signal<'form' | 'stepper' | 'form-rows' | null>('form');

  protected showForm(): void {
    this.view.set('form');
  }

  protected showModalStepper(): void {
    this.view.set('stepper');
  }

  protected showFormRows(): void {
    this.view.set('form-rows');
  }

  public ngOnInit(): void {}
}
