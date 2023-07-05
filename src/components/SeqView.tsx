import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useParams } from "react-router";
import { useTracked } from "../lib/store";
import { Call, SequenceId } from "../lib/types";
import { EditSeqInfo, ViewSeqInfo } from "./SeqInfo";
import { Link } from "react-router-dom";

function CallBox(props: { call: Call } & BoxProps) {
  const { call, comment, warnings } = props.call;
  return (
    <Box {...props}>
      <Text color="orange.500" fontSize="xl">
        {comment}
      </Text>
      <Text fontSize="xl">{call}</Text>
      <Text ml={8}>{warnings}</Text>
    </Box>
  );
}

export default function SeqView() {
  const { seqId } = useParams();
  const seq = useTracked().db.getSeq(SequenceId(seqId ?? ""));
  const [callIdx] = useState(0);
  const next = useTracked().search.next;

  if (!seq) return <>Can't find sequence {seqId}</>;

  const past = seq.calls.slice(0, callIdx);
  const present = seq.calls[callIdx];
  const future = seq.calls.slice(callIdx + 1);

  const nextSeqs = next(seq, 3);

  return (
    <Flex w="100%" gap={4}>
      <Flex direction="column" gap={4} w="sm">
        you are on:
        <EditSeqInfo seq={seq} />
      </Flex>
      <Flex direction="column" flex={1} gap={4}>
        <Text fontSize="lg" opacity={0.3}>
          {past.map((call) => call.call).join(" / ")}
        </Text>
        <CallBox call={present} />
        {future.map((call, idx) => (
          <CallBox key={idx} call={call} opacity={callIdx > 0 ? 0.3 : 1} />
        ))}
      </Flex>
      <Flex direction="column" gap={4}>
        some sequences that satisfy the above query:
        {nextSeqs.map((seq) => (
          <ViewSeqInfo key={seq.id} seq={seq} />
        ))}
      </Flex>
    </Flex>
  );
}
