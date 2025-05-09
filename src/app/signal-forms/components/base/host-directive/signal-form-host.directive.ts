import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[signalForHost]', standalone: true })
export class SignalFormHostDirective {
  constructor(public readonly viewContainerRef: ViewContainerRef) {}
}
