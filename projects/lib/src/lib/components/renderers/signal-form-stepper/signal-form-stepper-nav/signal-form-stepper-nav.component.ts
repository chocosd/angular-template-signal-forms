import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  model,
  Signal,
  signal,
} from '@angular/core';
import { LucideAngularModule, SquareCheck } from 'lucide-angular';
import {
  type MetaValidatorFn,
  type SignalFormContainer,
} from '../../../../models/signal-form.model';

export enum StepStatus {
  Complete = 'complete',
  Error = 'error',
  InComplete = 'incomplete',
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, LucideAngularModule],
  selector: 'signal-form-stepper-nav',
  standalone: true,
  styleUrl: './signal-form-stepper-nav.component.scss',
  templateUrl: './signal-form-stepper-nav.component.html',
})
export class SignalFormStepperNavComponent<TModel> {
  public hasSaved = input<boolean>();
  public steps = input.required<SignalFormContainer<TModel>[]>();
  public currentStep = model.required<number>();

  public doesStepHaveErrors = signal<boolean[]>([]);
  public isStepComplete = signal<boolean[]>([]);

  protected requiredPerStepMap = signal<{ [val: number]: Signal<StepStatus> }>(
    {},
  );

  protected readonly stepStatus = StepStatus;
  protected readonly squareCheckIcon = SquareCheck;

  private readonly injector = inject(Injector);

  constructor() {
    this.isStepCompleteOrErrorEffect();
    this.requiredPerStepMapEffect();
  }

  public goToStep(index: number): void {
    const steps = this.steps();
    const canSkip = true;

    if (
      index <= this.currentStep() ||
      canSkip ||
      steps[this.currentStep()].validateForm()
    ) {
      this.currentStep.set(index);
    }
  }

  private isStepCompleteOrErrorEffect(): void {
    effect(
      () => {
        const validatedMap = this.steps().map((step) => step.validateForm());
        this.isStepComplete.set(validatedMap);

        const errorsMap = this.steps().map(
          (step) => step.getErrors().length > 0,
        );
        this.doesStepHaveErrors.set(errorsMap);
      },
      { injector: this.injector },
    );
  }

  private requiredPerStepMapEffect(): void {
    effect(
      () => {
        if (this.steps()) {
          this.initRequiredPerStepMap();
        }
      },
      { injector: this.injector },
    );
  }

  private initRequiredPerStepMap(): void {
    const requiredPerStepMap = this.steps().reduce((prev, step, i) => {
      const requiredPerStep = step.fields.filter((field) =>
        field.validators?.some(
          (validator) =>
            (validator as MetaValidatorFn<TModel[keyof TModel], TModel>).__meta
              ?.required,
        ),
      );

      const stepStatus = requiredPerStep.map((step) => {
        if (!!step.error()) {
          return StepStatus.Error;
        }

        if (!!step.value()) {
          return StepStatus.Complete;
        }

        return StepStatus.InComplete;
      });

      return {
        ...prev,
        [i]: computed(() => stepStatus),
      };
    }, {});

    this.requiredPerStepMap.set(requiredPerStepMap);
  }
}
