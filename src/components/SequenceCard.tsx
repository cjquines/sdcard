import { Flex, Link, Tag, Text } from "@chakra-ui/react";
import { RawSequence } from "../lib/types";
import { formatDate } from "../lib/dates";

export default function SequenceCard({ seq }: { seq: RawSequence }) {
  const { date, level, comment, calls } = seq;

  return (
    <Flex
      p="2"
      boxShadow="xs"
      gap="2"
      maxW="md"
      align="baseline"
      sx={{
        "&.sortable-ghost": { background: "gray.100" },
        "&.sortable-selected": { background: "gray.100" },
      }}
    >
      <Tag className="handle" cursor="move">
        {level}
      </Tag>
      <Link>
        <Text color="gray" display="inline">
          <time dateTime={new Date(date).toISOString()}>
            {formatDate(date)}
          </time>
          {comment ? ": " : null}
        </Text>
        {comment ? <Text display="inline">{comment}</Text> : null}
      </Link>
      <Text color="gray" fontSize="sm" flex="1" noOfLines={1}>
        {calls.map((call) => call.call).join(" / ")}
      </Text>
    </Flex>
  );
}
