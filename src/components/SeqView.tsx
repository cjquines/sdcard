import { Flex } from "@chakra-ui/react";
import { useParams } from "react-router";
import { useTracked } from "../lib/store";
import { SequenceId } from "../lib/types";
import SeqInfo from "./SeqInfo";

export default function SeqView() {
  const { seqId } = useParams();
  const seq = useTracked().db.getSeq(SequenceId(seqId ?? ""));
  if (!seq) return <>Can't find sequence {seqId}</>;

  return (
    <Flex w="100%">
      <Flex direction="column" flex="1">
        {seq.calls.map((call) => (
          <p>{call.call}</p>
        ))}
      </Flex>
      <Flex direction="column">
        <SeqInfo seq={seq} />
      </Flex>
    </Flex>
  );
}
