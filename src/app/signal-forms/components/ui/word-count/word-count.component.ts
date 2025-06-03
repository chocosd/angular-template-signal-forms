import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  WordCountService,
  type WordCountStats,
} from '../../../services/word-count.service';

@Component({
  selector: 'signal-form-word-count',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="word-count" [class.word-count-compact]="compact()">
      <span class="word-count-text">{{ formattedCount() }}</span>
    </div>
  `,
  styleUrl: './word-count.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordCountComponent {
  /** The text to count words for */
  public text = input<string | null | undefined>('');

  /** Display format for the word count */
  public format = input<'words' | 'characters' | 'both' | 'detailed'>('words');

  /** Whether to show compact styling */
  public compact = input<boolean>(false);

  protected readonly stats = computed(
    (): WordCountStats => this.wordCountService.getWordCount(this.text()),
  );

  protected readonly formattedCount = computed((): string =>
    this.wordCountService.formatWordCount(this.stats(), this.format()),
  );

  private readonly wordCountService = inject(WordCountService);
}
