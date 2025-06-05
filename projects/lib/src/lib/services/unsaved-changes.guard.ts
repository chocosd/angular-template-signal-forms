import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component,
) => {
  if (component.hasUnsavedChanges()) {
    return confirm(
      'You have unsaved changes. Are you sure you want to leave this page?',
    );
  }
  return true;
};
