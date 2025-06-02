import {
  assertInInjectionContext,
  effect,
  HostAttributeToken,
  inject,
  Injector,
  isSignal,
  signal,
  Signal,
} from '@angular/core';

export function hostAttr<R>(key: string, defaultValue: R): R {
  assertInInjectionContext(hostAttr);

  return (
    (inject(new HostAttributeToken(key), { optional: true }) as R) ??
    defaultValue
  );
}

hostAttr.required = function <R>(key: string): R {
  assertInInjectionContext(hostAttr);
  return inject(new HostAttributeToken(key)) as R;
};

/**
 * Enhanced hostAttr that can work with signals or static values
 * Uses an effect to track signal changes and returns the current value
 */
export function dynamicHostAttr<T>(
  key: string,
  value: T | Signal<T>,
  defaultValue?: T,
  injector?: Injector,
): T | undefined {
  assertInInjectionContext(dynamicHostAttr);

  if (isSignal(value)) {
    const currentInjector = injector ?? inject(Injector);
    const currentValue = signal<T | undefined>(value());

    effect(
      () => {
        const signalValue = value();

        if (!value()) {
          return;
        }
        currentValue.set(signalValue ?? defaultValue);
      },
      { injector: currentInjector },
    );

    return currentValue();
  } else {
    return value ?? defaultValue;
  }
}
