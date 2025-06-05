import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[signalFormHost]',
  standalone: true,
})
export class SignalFormHostDirective {
  constructor(public readonly viewContainerRef: ViewContainerRef) {}
}
