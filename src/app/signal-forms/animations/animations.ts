import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const expandCollapse = trigger('expandCollapse', [
  state(
    'open',
    style({
      height: '*',
      opacity: 1,
      overflow: 'hidden',
    }),
  ),
  state(
    'closed',
    style({
      height: '0px',
      opacity: 0,
      overflow: 'hidden',
    }),
  ),
  transition('open <=> closed', animate('600ms ease-in')),
  transition('closed <=> open', animate('600ms ease-out')),
]);

export const growFadeIn = trigger('growFadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scaleY(0.95)', height: 0 }),
    animate(
      '350ms ease-out',
      style({ opacity: 1, transform: 'scaleY(1)', height: '*' }),
    ),
  ]),
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('150ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
]);
