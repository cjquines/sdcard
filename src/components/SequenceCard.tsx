import { Flex, Tag, Text } from "@chakra-ui/react";
import { Sequence } from "../lib/types";
import { formatDate } from "../lib/dates";

export default function SequenceCard({ seq }: { seq: Sequence }) {
  const { date, level, comment, calls } = seq;

  return (
    <Flex
      p="2"
      boxShadow="xs"
      gap="2"
      maxW="sm"
      align="baseline"
      sx={{
        "&.sortable-ghost": { background: "gray.100" },
        "&.sortable-selected": { background: "gray.100" },
      }}
    >
      <Tag className="handle" cursor="move">
        {level}
      </Tag>
      <Text color="gray">
        <time dateTime={new Date(date).toISOString()}>{formatDate(date)}</time>
      </Text>
      {comment}
      <Text color="gray" fontSize="sm" flex="1" noOfLines={1}>
        {calls.map((call) => call.call).join(" / ")}
      </Text>
    </Flex>
  );
}
