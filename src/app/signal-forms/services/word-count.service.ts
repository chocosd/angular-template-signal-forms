import { Injectable } from '@angular/core';

export interface WordCountStats {
  characters: number;
  words: number;
  charactersWithSpaces: number;
  lines: number;
}

@Injectable({
  providedIn: 'root',
})
export class WordCountService {
  /**
   * Counts words, characters, and lines in the given text
   */
  getWordCount(text: string | null | undefined): WordCountStats {
    if (!text) {
      return {
        characters: 0,
        words: 0,
        charactersWithSpaces: 0,
        lines: 0,
      };
    }

    const charactersWithSpaces = text.length;
    const characters = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;

    // Count words by splitting on whitespace and filtering empty strings
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    return {
      characters,
      words,
      charactersWithSpaces,
      lines,
    };
  }

  /**
   * Formats word count for display
   */
  formatWordCount(
    stats: WordCountStats,
    format: 'words' | 'characters' | 'both' | 'detailed' = 'words',
  ): string {
    switch (format) {
      case 'words':
        return `${stats.words} word${stats.words !== 1 ? 's' : ''}`;

      case 'characters':
        return `${stats.characters} character${stats.characters !== 1 ? 's' : ''}`;

      case 'both':
        return `${stats.words} word${stats.words !== 1 ? 's' : ''}, ${stats.characters} character${stats.characters !== 1 ? 's' : ''}`;

      case 'detailed':
        return `${stats.words} words | ${stats.characters} chars | ${stats.lines} lines`;

      default:
        return `${stats.words} word${stats.words !== 1 ? 's' : ''}`;
    }
  }
}
