import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Tag as TagElement,
} from "@chakra-ui/react";
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
import {
  OptionType,
  PartialSearchOption,
  Query,
  SearchOption,
} from "../lib/search";

export function ViewQueryInfo(props: { query: Query } & FlexProps) {
  const { query } = props;
  return (
    <Flex gap={1} {...props}>
      {query.map(({ label }) => (
        <TagElement>{label}</TagElement>
      ))}
    </Flex>
  );
}

/** Make a default option like "tag:" or "-tag:". */
const makeDefaultOption = (
  text: OptionType,
  negated: boolean,
  category?: CategoryId,
): SearchOption => {
  return SearchOption.make({
    type: OptionType.PARTIAL,
    text,
    negated,
    category,
  });
};

/** Make all default options. */
const useMakeDefaultOptions = () => {
  const categories = useTracked().db.categories();

  return useCallback(
    (negated: boolean): SearchOption[] => {
      const options = [];

      // non-category and non-partial each get one
      for (const type of SearchOption.MAP.values()) {
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
    [categories],
  );
};

const customComponents = {
  MultiValueRemove: (props: MultiValueRemoveProps<SearchOption>) =>
    SearchOption.isPartial(props.data) ? null : (
      <chakraComponents.MultiValueRemove
        {...props}
      ></chakraComponents.MultiValueRemove>
    ),
};

/** Make a list of options out of a given PartialSearchOption. */
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
            (option) =>
              SearchOption.make({
                type: OptionType.CATEGORY,
                text: option,
                negated,
                id: category,
                category: categories.get(category)?.name ?? "",
              }),
          );
        }
        case OptionType.LEVEL: {
          return Array.from(LEVEL_MAP.values()).map((level) =>
            SearchOption.make({
              type: OptionType.LEVEL,
              text: level,
              negated,
            }),
          );
        }
        case OptionType.TAG: {
          return Array.from(tags.keys()).map((tag) =>
            SearchOption.make({
              type: OptionType.TAG,
              id: tag,
              text: tags.get(tag)?.name ?? "",
              negated,
            }),
          );
        }
      }
    },
    [categories, tags, makeDefaultOptions],
  );
};

export function EditQueryInfo(
  props: { query: Query; setQuery: (value: Query) => void } & BoxProps,
) {
  const { query, setQuery } = props;
  const makeOptions = useMakeOptions();
  const makeDefaultOptions = useMakeDefaultOptions();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(makeDefaultOptions(false));

  const onInputChange = (input: string) => {
    // if we have a partial, then prepend it to input
    const partial = query.find(SearchOption.isPartial);
    const modInput = !partial
      ? input
      : partial.label === "-"
      ? `-${input}`
      : `${partial.label} ${input}`;

    // if it directly matches an option, we take it
    const option = options.find((option) => option.label === modInput);
    if (option) {
      setInput("");
      onChange([...query, option], { action: "select-option", option });
      return;
    }

    // otherwise, pass through
    setInput(input);
  };

  const onChange = (
    newValue: MultiValue<SearchOption>,
    action: ActionMeta<SearchOption>,
  ) => {
    if (
      action.action === "select-option" &&
      action.option &&
      SearchOption.isPartial(action.option)
    ) {
      // partial case: generate new options
      // remove any partials (that aren't this one)
      setQuery(
        newValue.filter(
          (option) => option === action.option || SearchOption.isFull(option),
        ),
      );
      setOptions(makeOptions(action.option));
    } else {
      // not partial case: generate partial options
      setQuery(newValue.filter(SearchOption.isFull));
      setOptions(makeDefaultOptions(false));
    }
  };

  return (
    <Box flex={1} {...props}>
      <Select<SearchOption, true>
        chakraStyles={{
          menu: (provided) => ({
            ...provided,
            zIndex: "2",
          }),
        }}
        components={customComponents}
        closeMenuOnSelect={false}
        isMulti={true}
        inputValue={input}
        onInputChange={onInputChange}
        options={options}
        onChange={onChange}
        value={query}
      />
    </Box>
  );
}
