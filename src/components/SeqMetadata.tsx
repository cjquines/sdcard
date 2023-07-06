import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Tag,
  Text,
} from "@chakra-ui/react";
import { CategoryOption, Metadata } from "../lib/metadata";
import { useTracked } from "../lib/store";
import { ActionMeta } from "chakra-react-select";
import TagSelect, { TagOption } from "./TagSelect";

export function ViewMetadata({ meta }: { meta: Metadata }) {
  const { categories, tags } = meta;
  return (
    <Flex direction="column" gap={2}>
      {Array.from(categories.entries()).map(([category, value]) => (
        <Box key={category}>
          <Text display="inline" color="gray">
            {category}:
          </Text>{" "}
          {value}
        </Box>
      ))}
      <Flex gap={1}>
        {Array.from(tags.values()).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Flex>
    </Flex>
  );
}

export function EditMetadata({
  meta,
  setMeta,
}: {
  meta: Metadata;
  setMeta: (edit: (meta: Metadata) => void) => void;
}) {
  const categories = useTracked().db.categories();

  const onChangeTags = (action: ActionMeta<TagOption>) => {
    switch (action.action) {
      case "select-option": {
        return setMeta((meta) => {
          if (action.option) {
            Metadata.addTag(meta, action.option.value);
          }
        });
      }
      case "pop-value":
      case "remove-value": {
        return setMeta((meta) => {
          if (action.removedValue) {
            Metadata.removeTag(meta, action.removedValue.value);
          }
        });
      }
      case "clear": {
        return setMeta((meta) => {
          Metadata.edit(
            meta,
            { tags: new Set(action.removedValues.map(({ value }) => value)) },
            false
          );
        });
      }
    }
  };

  return (
    <Flex direction="column">
      {Array.from(categories.values()).map(({ id, name, comment, options }) => (
        <FormControl key={name} as="fieldset">
          <FormLabel as="legend">{name}:</FormLabel>
          <RadioGroup
            defaultChecked={false}
            value={meta.categories.get(id) ?? ""}
            onChange={(option: CategoryOption) =>
              setMeta((meta) => Metadata.addOption(meta, id, option))
            }
          >
            <HStack wrap="wrap">
              {options.map((option) => (
                <Radio key={option} value={option}>
                  {option}
                </Radio>
              ))}
              <Button
                onClick={() =>
                  setMeta((meta) => Metadata.removeOption(meta, id))
                }
                size="sm"
                variant="outline"
              >
                Clear
              </Button>
            </HStack>
          </RadioGroup>
          <FormHelperText>{comment}</FormHelperText>
        </FormControl>
      ))}
      <FormControl>
        <FormLabel>Tags:</FormLabel>
        <TagSelect initial={meta.tags} multiOnChange={onChangeTags} />
      </FormControl>
    </Flex>
  );
}
