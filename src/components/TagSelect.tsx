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
  label: string;
};

const customComponents = {
  MultiValueLabel: (props: MultiValueGenericProps<TagOption>) => (
    <chakraComponents.MultiValueLabel {...props}>
      {props.data.value}
    </chakraComponents.MultiValueLabel>
  ),
};

export default function TagSelect({
  initialTags,
  onChange,
}: {
  initialTags: Set<TagId>;
  onChange: (action: ActionMeta<TagOption>) => void;
}) {
  const tags = useTracked().db.tags();

  const tagOptions = useMemo(() => {
    return Array.from(tags.values()).map(({ tag, comment }) => ({
      value: tag,
      label: `${tag}${comment ? ` (${comment})` : ""}`,
    }));
  }, [tags]);

  const defaultValue = useMemo(() => {
    return tagOptions.filter(({ value }) => initialTags.has(value));
  }, [tagOptions, initialTags]);

  return (
    <Select<TagOption, true>
      components={customComponents}
      closeMenuOnSelect={false}
      isMulti={true}
      options={tagOptions}
      defaultValue={defaultValue}
      onChange={(_, action) => onChange(action)}
    />
  );
}
