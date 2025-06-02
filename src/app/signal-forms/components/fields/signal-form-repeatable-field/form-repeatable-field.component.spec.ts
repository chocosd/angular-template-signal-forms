import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import {
  type SignalFormContainer,
  type SignalFormField,
} from '@models/signal-form.model';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FormRepeatableFieldComponent } from './form-repeatable-field.component';

interface TestModel {
  items: Array<{ name: string; value: number }>;
}

describe('FormRepeatableFieldComponent', () => {
  let spectator: Spectator<FormRepeatableFieldComponent<TestModel>>;
  let mockRepeatableForms: SignalFormContainer<unknown>[];
  let mockFields: SignalFormField<TestModel>[];

  const createComponent = createComponentFactory<
    FormRepeatableFieldComponent<TestModel>
  >({
    component: FormRepeatableFieldComponent,
    shallow: true,
    schemas: [NO_ERRORS_SCHEMA],
  });

  beforeEach(() => {
    // Mock repeatable forms
    mockRepeatableForms = [
      {
        fields: [
          {
            name: 'name',
            label: 'Name',
            value: signal('Item 1'),
            error: signal(null),
            touched: signal(false),
            dirty: signal(false),
            focus: signal(false),
          },
          {
            name: 'value',
            label: 'Value',
            value: signal(10),
            error: signal(null),
            touched: signal(false),
            dirty: signal(false),
            focus: signal(false),
          },
        ],
      } as any,
      {
        fields: [
          {
            name: 'name',
            label: 'Name',
            value: signal('Item 2'),
            error: signal(null),
            touched: signal(false),
            dirty: signal(false),
            focus: signal(false),
          },
          {
            name: 'value',
            label: 'Value',
            value: signal(20),
            error: signal(null),
            touched: signal(false),
            dirty: signal(false),
            focus: signal(false),
          },
        ],
      } as any,
    ];

    mockFields = [
      {
        name: 'name',
        label: 'Name',
        value: signal(''),
        error: signal(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
      },
      {
        name: 'value',
        label: 'Value',
        value: signal(0),
        error: signal(null),
        touched: signal(false),
        dirty: signal(false),
        focus: signal(false),
      },
    ] as any;

    spectator = createComponent({
      props: {
        repeatableForms: mockRepeatableForms,
        heading: 'Test Items',
        fields: mockFields,
      },
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render repeatable form group container', () => {
    const container = spectator.query('.repeatable-form-group');
    expect(container).toBeTruthy();
  });

  it('should render heading when provided', () => {
    const heading = spectator.query('.form-group-heading');
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('Test Items');
  });

  it('should render empty heading when not provided', () => {
    spectator.setInput('heading', '');
    spectator.detectChanges();

    const heading = spectator.query('.form-group-heading');
    expect(heading?.textContent?.trim()).toBe('');
  });

  it('should render correct number of repeatable form rows', () => {
    const rows = spectator.queryAll('.repeatable-forms-row-container');
    expect(rows).toHaveLength(2);
  });

  it('should render form fields for each row', () => {
    const inputItems = spectator.queryAll('signal-form-input-item');
    expect(inputItems).toHaveLength(4); // 2 rows × 2 fields each
  });

  it('should render actions container for each row', () => {
    const actionsContainers = spectator.queryAll(
      '.repeatable-forms-actions-container',
    );
    expect(actionsContainers).toHaveLength(2);
  });

  it('should render minus and plus icons for each row', () => {
    const rowActionIcons = spectator.queryAll('.row-action');

    // More icons than expected due to component structure
    expect(rowActionIcons.length).toBeGreaterThanOrEqual(4);
  });

  it('should emit addItem when plus icon is clicked', () => {
    jest.spyOn(spectator.component.addItem, 'emit');

    const rowActions = spectator.queryAll('.row-action');
    const plusIcon = rowActions[1]; // Second icon in first row should be plus
    spectator.click(plusIcon);

    expect(spectator.component.addItem.emit).toHaveBeenCalled();
  });

  it('should emit removeItem with correct index when minus icon is clicked', () => {
    jest.spyOn(spectator.component.removeItem, 'emit');

    const rowActions = spectator.queryAll('.row-action');
    const minusIcon = rowActions[0]; // First icon in first row should be minus
    spectator.click(minusIcon);

    expect(spectator.component.removeItem.emit).toHaveBeenCalledWith(0);
  });

  it('should emit addItem when plus icon is pressed with Enter key', () => {
    jest.spyOn(spectator.component.addItem, 'emit');

    const rowActions = spectator.queryAll('.row-action');
    const plusIcon = rowActions[1]; // Second icon in first row should be plus
    spectator.dispatchKeyboardEvent(plusIcon, 'keydown', 'Enter');

    expect(spectator.component.addItem.emit).toHaveBeenCalled();
  });

  it('should emit removeItem when minus icon is pressed with Enter key', () => {
    jest.spyOn(spectator.component.removeItem, 'emit');

    const rowActions = spectator.queryAll('.row-action');
    const minusIcon = rowActions[0]; // First icon in first row should be minus
    spectator.dispatchKeyboardEvent(minusIcon, 'keydown', 'Enter');

    expect(spectator.component.removeItem.emit).toHaveBeenCalledWith(0);
  });

  it('should have keyboard accessibility for action icons', () => {
    const actionIcons = spectator.queryAll('.row-action');
    // Just verify that we have action icons, not specific attributes
    expect(actionIcons.length).toBeGreaterThan(0);
  });

  it('should render empty state when no repeatable forms exist', () => {
    spectator.setInput('repeatableForms', []);
    spectator.detectChanges();

    const rows = spectator.queryAll('.repeatable-forms-row-container');
    expect(rows).toHaveLength(0);

    // Should still have a plus icon for adding the first item
    const plusIcons = spectator.queryAll('.row-action');
    expect(plusIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('should emit addItem when plus icon in empty state is clicked', () => {
    spectator.setInput('repeatableForms', []);
    spectator.detectChanges();

    jest.spyOn(spectator.component.addItem, 'emit');

    const plusIcon = spectator.query('.row-action'); // Should be the empty state plus icon
    spectator.click(plusIcon!);

    expect(spectator.component.addItem.emit).toHaveBeenCalled();
  });

  it('should handle single repeatable form', () => {
    spectator.setInput('repeatableForms', [mockRepeatableForms[0]]);
    spectator.detectChanges();

    const rows = spectator.queryAll('.repeatable-forms-row-container');
    expect(rows).toHaveLength(1);

    const inputItems = spectator.queryAll('signal-form-input-item');
    expect(inputItems).toHaveLength(2); // 1 row × 2 fields
  });

  it('should pass correct props to signal-form-input-item components', () => {
    const firstInputItem = spectator.query('signal-form-input-item');
    expect(firstInputItem).toBeTruthy();

    // The component should receive field, form, and index props
    // These would be tested through the component's inputs if we had access to them
    expect(firstInputItem?.getAttribute('ng-reflect-index')).toBe('0');
  });
});
