export type MaskToken = '9' | 'A' | '*';
export type MaskDefinition = Record<MaskToken, RegExp>;

export class MaskParser {
  static readonly DEFAULT_MASK_DEFINITION: MaskDefinition = {
    '9': /\d/,
    A: /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/,
  };

  public static format(
    value: string,
    mask: string,
    defs = this.DEFAULT_MASK_DEFINITION,
  ): string {
    let result = '';
    let rawIndex = 0;

    for (let i = 0; i < mask.length; i++) {
      const maskChar = mask[i];
      const def = defs[maskChar as MaskToken];

      if (def) {
        while (rawIndex < value.length) {
          const rawChar = value[rawIndex++];
          if (def.test(rawChar)) {
            result += rawChar;
            break;
          }
        }
      } else {
        result += maskChar;
      }
    }

    return result;
  }

  public static unmask(
    formatted: string,
    mask: string,
    defs = this.DEFAULT_MASK_DEFINITION,
  ): string {
    let raw = '';
    for (let i = 0; i < mask.length && i < formatted.length; i++) {
      const def = defs[mask[i] as MaskToken];
      if (def && def.test(formatted[i])) {
        raw += formatted[i];
      }
    }
    return raw;
  }

  public static getEditableLength(
    mask: string,
    defs = this.DEFAULT_MASK_DEFINITION,
  ): number {
    return [...mask].filter((c) => defs[c as MaskToken]).length;
  }

  public static getMaxLength(mask: string): number {
    return mask.length;
  }

  public static getNextEditableIndex(
    mask: string,
    pos: number,
    defs = this.DEFAULT_MASK_DEFINITION,
  ): number {
    for (let i = pos; i < mask.length; i++) {
      if (defs[mask[i] as MaskToken]) return i;
    }
    return mask.length;
  }

  public static getPreviousEditableIndex(
    mask: string,
    pos: number,
    defs = this.DEFAULT_MASK_DEFINITION,
  ): number {
    for (let i = pos - 1; i >= 0; i--) {
      if (defs[mask[i] as MaskToken]) return i;
    }
    return 0;
  }

  public static getEditableIndices(mask: string): number[] {
    const defs = this.DEFAULT_MASK_DEFINITION;
    return [...mask]
      .map((char, i) => (defs[char as keyof typeof defs] ? i : -1))
      .filter((i) => i !== -1);
  }
}
