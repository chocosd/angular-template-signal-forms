import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import {
  ChevronDownCircleIcon,
  ChevronUpCircleIcon,
  LucideAngularModule,
} from 'lucide-angular';
import { expandCollapse, growFadeIn } from '../../../animations/animations';
import { type ExpandedAnimationEvent } from '../../../models/signal-form.model';

@Component({
  selector: 'collapsable-section',
  standalone: true,
  imports: [NgTemplateOutlet, LucideAngularModule],
  animations: [expandCollapse, growFadeIn],
  templateUrl: './collapsable-section.component.html',
  styleUrls: ['./collapsable-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsableSectionComponent {
  public collapsedInitially = input<boolean>(false);

  public bodyTemplate? = input<TemplateRef<unknown>>();
  public summaryTemplate? = input<TemplateRef<unknown>>();

  public bodyTemplateContext? = input<unknown>();
  public summaryTemplateContext? = input<unknown>();

  protected collapsing = signal(false);
  protected collapsed = signal(false);

  protected readonly chevronDown = ChevronDownCircleIcon;
  protected readonly chevronUp = ChevronUpCircleIcon;

  constructor() {
    // Initialize collapsed state from input
    effect(() => {
      this.collapsed.set(this.collapsedInitially());
    });
  }

  protected toggle(): void {
    if (!this.collapsed()) {
      this.collapsing.set(true);
      return;
    }

    this.collapsed.set(false);
    this.collapsing.set(false);
  }

  protected shouldShow = computed(() => !this.collapsed() || this.collapsing());

  protected onDone(event: ExpandedAnimationEvent): void {
    if (event.toState === 'closed') {
      this.collapsed.set(true);
      this.collapsing.set(false);
    }
  }
}
