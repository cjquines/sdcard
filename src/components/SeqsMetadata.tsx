import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { produce } from "immer";
import { useState } from "react";
import { Sequence } from "../lib/types";
import { CategoryOption, Metadata } from "../lib/metadata";
import { actions, useTracked } from "../lib/store";
import { ActionMeta } from "chakra-react-select";
import TagSelect, { TagOption } from "./TagSelect";

/** Viewing / editing sequence metadata. */
export default function SeqsMetadata({ seqs }: { seqs: Sequence[] }) {
  const [seqMeta, setSeqMeta] = useState(Metadata.intersect(seqs));
  const categories = useTracked().db.categories();

  const editBoth = (edit: (meta: Metadata) => void) => {
    setSeqMeta(produce((meta) => edit(meta)));
    seqs.forEach((seq) => actions.db.editSeq(seq.id, edit));
  };

  const onChangeTags = (action: ActionMeta<TagOption>) => {
    switch (action.action) {
      case "select-option": {
        return editBoth((meta) => {
          if (action.option) {
            Metadata.addTag(meta, action.option.value);
          }
        });
      }
      case "pop-value":
      case "remove-value": {
        return editBoth((meta) => {
          if (action.removedValue) {
            Metadata.removeTag(meta, action.removedValue.value);
          }
        });
      }
      case "clear": {
        return editBoth((meta) => {
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
    <>
      {Array.from(categories.values()).map(({ category, comment, options }) => (
        <FormControl key={category} as="fieldset">
          <FormLabel as="legend">{category}</FormLabel>
          <RadioGroup
            value={seqMeta.categories.get(category)}
            onChange={(option: CategoryOption) =>
              editBoth((meta) => Metadata.addOption(meta, category, option))
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
                  editBoth((meta) => Metadata.removeOption(meta, category))
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
        <FormLabel>Tags</FormLabel>
        <TagSelect initialTags={seqMeta.tags} onChange={onChangeTags} />
      </FormControl>
    </>
  );
}
