import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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

@Component({
  selector: 'collapsible-section',
  standalone: true,
  imports: [NgTemplateOutlet, LucideAngularModule],
  animations: [expandCollapse, growFadeIn],
  templateUrl: './collapsible-section.component.html',
  styleUrls: ['./collapsible-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSectionComponent {
  public collapsedInitially = input<boolean>(false);

  public bodyTemplate? = input<TemplateRef<unknown>>();
  public summaryTemplate? = input<TemplateRef<unknown>>();

  public bodyTemplateContext? = input<unknown>();
  public summaryTemplateContext? = input<unknown>();

  protected collapsing = signal(false);
  protected collapsed = signal(this.collapsedInitially());

  protected readonly chevronDown = ChevronDownCircleIcon;
  protected readonly chevronUp = ChevronUpCircleIcon;

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

export type ExpandedAnimationEvent = AnimationEvent & { toState: string };
