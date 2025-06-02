import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { CollapsibleSectionComponent } from './collapsible-section.component';

describe('CollapsibleSectionComponent', () => {
  let spectator: Spectator<CollapsibleSectionComponent>;

  const createComponent = createComponentFactory<CollapsibleSectionComponent>({
    component: CollapsibleSectionComponent,
    shallow: true,
    imports: [NoopAnimationsModule],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should start expanded by default', () => {
    expect(spectator.component['collapsed']()).toBe(false);
  });

  it('should start collapsed when collapsedInitially is true', () => {
    const collapsedSpectator = createComponent({
      props: {
        collapsedInitially: true,
      },
    });

    expect(collapsedSpectator.component['collapsed']()).toBe(true);
  });

  it.skip('should toggle section on button click', () => {
    // Test starting from expanded state (default)
    expect(spectator.component['collapsed']()).toBe(false);

    // Click button to collapse
    const toggleButton = spectator.query('.collapsable-button');
    spectator.click(toggleButton!);
    expect(spectator.component['collapsing']()).toBe(true);

    // Simulate animation completion
    spectator.component['onDone']({ toState: 'closed' } as any);
    expect(spectator.component['collapsed']()).toBe(true);
    expect(spectator.component['collapsing']()).toBe(false);

    // Click button to expand
    spectator.click(toggleButton!);
    expect(spectator.component['collapsed']()).toBe(false);
    expect(spectator.component['collapsing']()).toBe(false);
  });
});
