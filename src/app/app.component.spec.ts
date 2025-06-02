import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { AppComponent } from './app.component';
import { ExampleSignalFormRowsComponent } from './examples/example-signal-form-rows/example-signal-form-rows.component';
import { ExampleSignalFormStepperComponent } from './examples/example-signal-form-stepper/example-signal-form-stepper.component';
import { ExampleSignalFormComponent } from './examples/example-signal-form/example-signal-form.component';

describe.skip('AppComponent', () => {
  let spectator: Spectator<AppComponent>;

  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [
      ExampleSignalFormComponent,
      ExampleSignalFormRowsComponent,
      ExampleSignalFormStepperComponent,
    ],
    providers: [provideAnimations(), provideHttpClient()],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(spectator.component.title).toBe('signal-template-forms');
  });

  it('should render action buttons', () => {
    const buttons = spectator.queryAll('.form-button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent?.trim()).toBe('show form');
    expect(buttons[1].textContent?.trim()).toBe('show stepper form');
    expect(buttons[2].textContent?.trim()).toBe('show form rows');
  });

  it('should show form view by default', () => {
    expect(spectator.component['view']()).toBe('form');
    expect(spectator.query('example-signal-form')).toBeTruthy();
    expect(spectator.query('example-signal-form-stepper')).toBeFalsy();
    expect(spectator.query('example-signal-form-rows')).toBeFalsy();
  });

  it('should switch to stepper view when stepper button is clicked', () => {
    const stepperButton = spectator.queryAll('.form-button')[1];
    spectator.click(stepperButton);

    expect(spectator.component['view']()).toBe('stepper');
    expect(spectator.query('example-signal-form')).toBeFalsy();
    expect(spectator.query('example-signal-form-stepper')).toBeTruthy();
    expect(spectator.query('example-signal-form-rows')).toBeFalsy();
  });

  it('should switch to form rows view when form rows button is clicked', () => {
    const formRowsButton = spectator.queryAll('.form-button')[2];
    spectator.click(formRowsButton);

    expect(spectator.component['view']()).toBe('form-rows');
    expect(spectator.query('example-signal-form')).toBeFalsy();
    expect(spectator.query('example-signal-form-stepper')).toBeFalsy();
    expect(spectator.query('example-signal-form-rows')).toBeTruthy();
  });

  it('should switch back to form view when form button is clicked', () => {
    // First switch to another view
    spectator.click(spectator.queryAll('.form-button')[1]);
    expect(spectator.component['view']()).toBe('stepper');

    // Then switch back to form view
    spectator.click(spectator.queryAll('.form-button')[0]);
    expect(spectator.component['view']()).toBe('form');
    expect(spectator.query('example-signal-form')).toBeTruthy();
  });

  it('should maintain correct button order', () => {
    const buttons = spectator.queryAll('.form-button');
    const actions = spectator.component['actions'];

    buttons.forEach((button, index) => {
      expect(button.textContent?.trim()).toBe(actions[index].label);
    });
  });

  it('should have correct layout styles', () => {
    const host = spectator.element;
    const buttonRow = spectator.query('.form-button-rows');
    const exampleView = spectator.query('.example-view');

    expect(getComputedStyle(host).display).toBe('flex');
    expect(getComputedStyle(host).flexDirection).toBe('column');
    expect(buttonRow).toBeTruthy();
    expect(exampleView).toBeTruthy();
  });
});
