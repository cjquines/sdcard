import { CategoryId, TagId } from "./metadata";
import { Level, Sequence } from "./types";

/**
 * There are two kinds of search options: full and partial. Partial ones are
 * incomplete, like "tag:", and we can't search while we have one of them.
 * Full ones are like "tag: asdf".
 */
export enum OptionType {
  CATEGORY = "category:",
  LEVEL = "level:",
  PARTIAL = "partial:",
  TAG = "tag:",
}

const MAP = new Map<string, OptionType>(
  Object.values(OptionType).map((val) => [`${val}`, val] as const),
);

export type PartialSearchOption = {
  label: string;
  value: {
    type: OptionType.PARTIAL;
    negated: boolean;
    text: OptionType;
    category?: CategoryId;
  };
};

type FullSearchOption = {
  label: string;
  value:
    | {
        type: OptionType.CATEGORY;
        negated: boolean;
        text: string;
        category: CategoryId;
      }
    | {
        type: OptionType.TAG;
        negated: boolean;
        text: TagId;
      }
    | {
        type: OptionType.LEVEL;
        negated: boolean;
        text: Level;
      };
};

/** Something that narrows a search. */
export type SearchOption = PartialSearchOption | FullSearchOption;

function isPartial(option: SearchOption): option is PartialSearchOption {
  return option.value.type === OptionType.PARTIAL;
}

function isFull(option: SearchOption): option is FullSearchOption {
  return !isPartial(option);
}

/** Make a label from a search option value. */
function makeLabel(value: SearchOption["value"]): string {
  const { type, text, negated } = value;
  const pieces = [];

  if (negated) {
    pieces.push("-");
  }

  if (type === OptionType.PARTIAL) {
    if (text === OptionType.CATEGORY) {
      pieces.push(`${value.category}:`);
    } else if (text !== OptionType.PARTIAL) {
      pieces.push(text);
    }
  } else if (type === OptionType.CATEGORY) {
    pieces.push(`${value.category}:`);
  } else {
    pieces.push(type);
  }

  if (type !== OptionType.PARTIAL && text) {
    pieces.push(` ${text}`);
  }

  return pieces.map((s) => s.toLowerCase()).join("");
}

/** Silly function to make a search option out of a value. */
function make(value: SearchOption["value"]): SearchOption {
  if (value.type === OptionType.PARTIAL) {
    return { value, label: makeLabel(value) };
  } else if (value.type === OptionType.CATEGORY) {
    return { value, label: makeLabel(value) };
  } else if (value.type === OptionType.TAG) {
    return { value, label: makeLabel(value) };
  } else if (value.type === OptionType.LEVEL) {
    return { value, label: makeLabel(value) };
  } else {
    return { value, label: makeLabel(value) };
  }
}

/** Does this sequence pass the given search option? */
function optionPass(option: SearchOption, sequence: Sequence): boolean {
  const { type, text, negated } = option.value;

  const result = (() => {
    switch (type) {
      case OptionType.CATEGORY: {
        return sequence.categories.get(option.value.category) === text;
      }
      case OptionType.TAG: {
        return sequence.tags.has(text);
      }
      case OptionType.LEVEL: {
        return sequence.level === text;
      }
      case OptionType.PARTIAL: {
        return true;
      }
    }
  })();

  return negated ? !result : result;
}

export type Query = {
  name: string;
  options: SearchOption[];
};

function queryPass(query: Query, sequence: Sequence): boolean {
  return query.options.every((option) => optionPass(option, sequence));
}

export const SearchOption = {
  MAP,
  isPartial,
  isFull,
  make,
  pass: optionPass,
};

export const Query = {
  pass: queryPass,
};
