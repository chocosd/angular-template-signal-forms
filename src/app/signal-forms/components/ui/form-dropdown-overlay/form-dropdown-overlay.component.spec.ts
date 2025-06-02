import { type FormOption } from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormDropdownOverlayComponent } from './form-dropdown-overlay.component';

describe('FormDropdownOverlayComponent', () => {
  let spectator: Spectator<FormDropdownOverlayComponent>;

  const createComponent = createComponentFactory<FormDropdownOverlayComponent>({
    component: FormDropdownOverlayComponent,
    shallow: true,
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        ariaListboxId: 'test-listbox',
        options: [{ label: 'Test', value: 'test' }] as FormOption<string>[],
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render options', () => {
    const options = spectator.queryAll('.dropdown-option');
    expect(options.length).toBe(1);
    expect(options[0].textContent).toContain('Test');
  });
});
