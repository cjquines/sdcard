import {
  ActionMeta,
  MultiValue,
  MultiValueRemoveProps,
  Select,
  chakraComponents,
} from "chakra-react-select";
import { useCallback, useState } from "react";
import { useTracked } from "../lib/store";
import { CategoryId } from "../lib/metadata";
import { LEVEL_MAP } from "../lib/types";

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

const SEARCH_OPTION_MAP = new Map<string, OptionType>(
  Object.values(OptionType).map((val) => [`${val}`, val] as const)
);

type PartialSearchOption = {
  value: {
    type: OptionType.PARTIAL;
    negated: boolean;
    text: OptionType;
    category?: CategoryId;
  };
  label: string;
};

type FullOptionType = Exclude<OptionType, OptionType.PARTIAL>;

type FullSearchOption =
  | {
      value: {
        type: OptionType.CATEGORY;
        negated: boolean;
        text: string;
        category: CategoryId;
      };
      label: string;
    }
  | {
      value: {
        type: Exclude<FullOptionType, OptionType.CATEGORY>;
        negated: boolean;
        text: string;
      };
      label: string;
    };

export type SearchOption = PartialSearchOption | FullSearchOption;

const makeLabel = (value: SearchOption["value"]): string => {
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

  return pieces.join("");
};

const isPartial = (option: SearchOption): option is PartialSearchOption =>
  option.value.type === OptionType.PARTIAL;

/** Make a default option like "tag:" or "-tag:". */
const makeDefaultOption = (
  text: OptionType,
  negated: boolean,
  category?: CategoryId
): SearchOption => {
  const value = { type: OptionType.PARTIAL, text, negated, category } as const;
  return { value, label: makeLabel(value) };
};

/** Make all default options. */
const useMakeDefaultOptions = () => {
  const categories = useTracked().db.categories();

  return useCallback(
    (negated: boolean): SearchOption[] => {
      const options = [];

      // non-category and non-partial each get one
      for (const type of SEARCH_OPTION_MAP.values()) {
        if (type !== OptionType.CATEGORY && type !== OptionType.PARTIAL) {
          options.push(makeDefaultOption(type, negated));
        }
      }

      // one for each category
      for (const category of categories.keys()) {
        options.push(makeDefaultOption(OptionType.CATEGORY, negated, category));
      }

      // if we're not negated, then we add a negate
      if (!negated) {
        options.push(makeDefaultOption(OptionType.PARTIAL, true));
      }

      return options;
    },
    [categories]
  );
};

const customComponents = {
  MultiValueRemove: (props: MultiValueRemoveProps<SearchOption>) =>
    isPartial(props.data) ? null : (
      <chakraComponents.MultiValueRemove
        {...props}
      ></chakraComponents.MultiValueRemove>
    ),
};

const useMakeOptions = () => {
  const categories = useTracked().db.categories();
  const tags = useTracked().db.tags();
  const makeDefaultOptions = useMakeDefaultOptions();

  return useCallback(
    (option: PartialSearchOption): SearchOption[] => {
      const { text, negated, category } = option.value;

      switch (text) {
        case OptionType.PARTIAL: {
          return makeDefaultOptions(negated);
        }
        case OptionType.CATEGORY: {
          if (!category) return [];
          return Array.from(categories.get(category)?.options ?? []).map(
            (option) => {
              const value = {
                type: OptionType.CATEGORY,
                text: option,
                negated,
                category,
              } as const;
              return { value, label: makeLabel(value) };
            }
          );
        }
        case OptionType.LEVEL: {
          return Array.from(LEVEL_MAP.values()).map((level) => {
            const value = {
              type: OptionType.LEVEL,
              text: level,
              negated,
            } as const;
            return { value, label: makeLabel(value) };
          });
        }
        case OptionType.TAG: {
          return Array.from(tags.keys()).map((tag) => {
            const value = {
              type: OptionType.TAG,
              text: tag,
              negated,
            } as const;
            return { value, label: makeLabel(value) };
          });
        }
      }
    },
    [categories, tags, makeDefaultOptions]
  );
};

export default function DBSearch() {
  const makeOptions = useMakeOptions();
  const makeDefaultOptions = useMakeDefaultOptions();

  const [input, setInput] = useState("");
  const [options, setOptions] = useState(makeDefaultOptions(false));
  const [value, setValue] = useState<MultiValue<SearchOption>>([]);

  const onInputChange = (input: string) => {
    // if we have a partial, then prepend it to input
    const partial = value.find(isPartial);
    const modInput = !partial
      ? input
      : partial.label === "-"
      ? `-${input}`
      : `${partial.label} ${input}`;

    // if it directly matches an option, we take it
    const option = options.find((option) => option.label === modInput);
    if (option) {
      setInput("");
      onChange([...value, option], { action: "select-option", option });
      return;
    }

    // otherwise, pass through
    setInput(input);
  };

  const onChange = (
    newValue: MultiValue<SearchOption>,
    action: ActionMeta<SearchOption>
  ) => {
    if (
      action.action === "select-option" &&
      action.option &&
      isPartial(action.option)
    ) {
      // partial case: generate new options
      // remove any partials (that aren't this one)
      setValue(
        newValue.filter(
          (option) => option === action.option || !isPartial(option)
        )
      );
      setOptions(makeOptions(action.option));
    } else {
      // not partial case: generate partial options
      setValue(newValue.filter((option) => !isPartial(option)));
      setOptions(makeDefaultOptions(false));
    }
  };

  return (
    <Select<SearchOption, true>
      components={customComponents}
      closeMenuOnSelect={false}
      isMulti={true}
      inputValue={input}
      onInputChange={onInputChange}
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
