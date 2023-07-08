import {
  Box,
  BoxProps,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router";
import { actions, useTracked } from "../lib/store";
import { Call, SequenceId } from "../lib/types";
import { EditSeqInfo } from "./SeqInfo";

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
  const navigate = useNavigate();
  const seq = useTracked()
    .db.sequences()
    .get(SequenceId(seqId ?? ""));

  const [callIdx, setCallIdx] = useState(0);
  const [willAutoTag, setWillAutoTag] = useState(true);
  const autoTag = useTracked().session.autoTag();
  const ongoing = useTracked().session.ongoing();

  useEffect(() => {
    setCallIdx(0);
    setWillAutoTag(true);
  }, [seqId, setWillAutoTag]);

  useHotkeys("up", () => setCallIdx(Math.max(0, callIdx - 1)), {
    preventDefault: true,
  });
  useHotkeys(
    "down",
    () => setCallIdx(Math.min((seq?.calls.length ?? 1) - 1, callIdx + 1)),
    { preventDefault: true },
  );
  useHotkeys(
    "left",
    () => {
      if (seq) {
        actions.session.unpop();
        navigate(-1);
      }
    },
    { preventDefault: true },
  );
  useHotkeys(
    "right",
    () => {
      if (seq && autoTag && willAutoTag) {
        actions.db.editSeq(seq.id, (seq) => seq.tags.add(autoTag));
      }
      const next = actions.session.pop();
      if (next) {
        navigate(`/sequence/${next}`);
      }
    },
    { preventDefault: true },
  );

  if (!seq) return <>Can't find sequence {seqId}</>;

  const present = seq.calls[callIdx];
  const future = seq.calls.slice(callIdx + 1);

  return (
    <Flex w="100%" gap={4}>
      <Flex direction="column" gap={4} w="sm">
        <EditSeqInfo seq={seq} />
        {!ongoing || !autoTag ? null : (
          <FormControl display="flex" gap={2}>
            <Switch
              isChecked={willAutoTag}
              onChange={(e) => setWillAutoTag(e.target.checked)}
            />
            <FormLabel>Auto tag before moving to next sequence</FormLabel>
          </FormControl>
        )}
      </Flex>
      <Flex direction="column" flex={1} gap={4}>
        <CallBox call={present} />
        {future.map((call, idx) => (
          <CallBox key={idx} call={call} opacity={callIdx > 0 ? 0.3 : 1} />
        ))}
      </Flex>
      <Flex direction="column" gap={4}>
        {/* TODO stacks */}
      </Flex>
    </Flex>
  );
}
