import {
  ActionMeta,
  MultiValueGenericProps,
  Select,
  chakraComponents,
} from "chakra-react-select";
import { useMemo } from "react";
import { useTracked } from "../lib/store";
import { TagId } from "../lib/metadata";

export type TagOption = {
  value: TagId;
  name: string;
  label: string;
};

const customComponents = {
  MultiValueLabel: (props: MultiValueGenericProps<TagOption>) => (
    <chakraComponents.MultiValueLabel {...props}>
      {props.data.name}
    </chakraComponents.MultiValueLabel>
  ),
};

export default function TagSelect({
  initial,
  onChange,
  multiOnChange,
}: {
  initial: null | TagId | Set<TagId>;
  onChange?: (id: null | TagId) => void;
  multiOnChange?: (action: ActionMeta<TagOption>) => void;
}) {
  const tags = useTracked().db.tags();
  const isMulti = initial instanceof Set;

  const tagOptions = useMemo(() => {
    return Array.from(tags.values()).map(({ id, name, comment }) => ({
      value: id,
      name,
      label: `${name}${comment ? ` (${comment})` : ""}`,
    }));
  }, [tags]);

  const defaultValue = useMemo(() => {
    return tagOptions.filter(({ value }) =>
      isMulti ? initial.has(value) : initial === value,
    );
  }, [tagOptions, initial, isMulti]);

  return isMulti ? (
    <Select<TagOption, true>
      components={customComponents}
      closeMenuOnSelect={false}
      isMulti={true}
      options={tagOptions}
      defaultValue={defaultValue}
      onChange={(_, action) => multiOnChange?.(action)}
    />
  ) : (
    <Select<TagOption, false>
      components={customComponents}
      isClearable={true}
      isMulti={false}
      options={tagOptions}
      defaultValue={defaultValue[0]}
      onChange={(option) => onChange?.(option?.value ?? null)}
    />
  );
}
