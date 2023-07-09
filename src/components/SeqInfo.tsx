import {
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  FlexProps,
  Tag as TagElement,
  TagProps,
  Text,
  TextProps,
} from "@chakra-ui/react";

import { Level, SequenceId } from "../lib/types";
import { fullFormatDate, fuzzyFormatDate } from "../lib/dates";
import { actions, useTracked } from "../lib/store";
import { EditMetadata, ViewMetadata } from "./MetadataInfo";
import { TagId } from "../lib/metadata";

const LEVEL_COLOR = {
  [Level.MS]: "cyan",
  [Level.PLUS]: "blue",
  [Level.A1]: "teal",
  [Level.A2]: "green",
  [Level.C1]: "yellow",
  [Level.C2]: "orange",
  [Level.C3A]: "red",
  [Level.C3]: "pink",
  [Level.C4]: "purple",
  [Level.ALL]: "gray",
};

export function LevelTag(props: { level: Level } & TagProps) {
  const { level } = props;
  return (
    <TagElement colorScheme={LEVEL_COLOR[level]} {...props}>
      {level}
    </TagElement>
  );
}

export function DateText(props: { date: number; full?: boolean } & TextProps) {
  const { date, full } = props;
  return (
    <Text color="gray" display="inline" {...props}>
      <time dateTime={new Date(date).toISOString()}>
        {full ? fullFormatDate(date) : fuzzyFormatDate(date)}
      </time>
    </Text>
  );
}

export function TagTag(props: { tagId: TagId } & TagProps) {
  const { tagId } = props;
  const { name } = useTracked().db.tags().get(tagId) ?? { name: "" };
  return <TagElement {...props}>{name}</TagElement>;
}

/**
 * A card showing a sequence's info, that can be clicked to navigate to that
 * sequence.
 */
export function ViewSeqInfo(props: { id: SequenceId } & FlexProps) {
  const { id } = props;
  const seq = useTracked().db.sequences().get(id);
  if (!seq) return null;
  const { date, level, comment } = seq;

  return (
    <Flex
      boxShadow="base"
      p={3}
      direction="column"
      gap={2}
      rounded="md"
      w="sm"
      _hover={{
        boxShadow: "md",
        background: "gray.50",
      }}
      {...props}
    >
      <Flex gap={3}>
        <LevelTag level={level} />
        <DateText date={date} full={false} />
      </Flex>
      <Text fontSize="lg" color={comment === "" ? "gray.400" : "inherit"}>
        {comment ?? "(no comment)"}
      </Text>
      <ViewMetadata meta={seq} />
    </Flex>
  );
}

/** A "card" for editing a sequence's info. */
export function EditSeqInfo(props: { id: SequenceId } & FlexProps) {
  const { id } = props;
  const seq = useTracked().db.sequences().get(id);
  if (!seq) return null;
  const { date, level, comment } = seq;

  return (
    <Flex direction="column" gap="2" {...props}>
      <Flex gap="2">
        <LevelTag level={level} />
        <DateText date={date} full={true} />
      </Flex>
      <Editable
        fontSize="lg"
        color={comment === "" ? "gray.400" : "inherit"}
        placeholder="(add comment)"
        value={comment}
        onChange={(value) =>
          actions.db.editSeq(id, (seq) => {
            seq.comment = value;
          })
        }
      >
        <EditablePreview />
        <EditableInput />
      </Editable>
      <Divider />
      <EditMetadata
        meta={seq}
        setMeta={(edit) => actions.db.editSeq(seq.id, edit)}
      />
    </Flex>
  );
}
