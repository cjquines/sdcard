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
import { ViewStackInfo } from "./StackInfo";

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
  const current = useTracked().session.current();
  const stackOrder = useTracked().session.stackOrder();

  useEffect(() => {
    if (seq && autoTag && willAutoTag) {
      actions.db.editSeq(seq.id, (seq) => seq.tags.add(autoTag));
    }
    setCallIdx(0);
    setWillAutoTag(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, setWillAutoTag]);

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
      if (!current) return;
      const next = actions.session.pushTo(current.id);
      if (!next) return;
      navigate(`/sequence/${next}`);
    },
    { preventDefault: true },
  );
  useHotkeys(
    "right",
    () => {
      if (!current) return;
      const next = actions.session.pullFrom(current.id);
      if (!next) return;
      navigate(`/sequence/${next}`);
    },
    { preventDefault: true },
  );

  if (!seq) return <>Can't find sequence {seqId}</>;

  const present = seq.calls[callIdx];
  const future = seq.calls.slice(callIdx + 1);

  return (
    <Flex w="100%" gap={4}>
      <Flex direction="column" gap={4} w="sm">
        <EditSeqInfo id={seq.id} />
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
        {present && <CallBox call={present} />}
        {future.map((call, idx) => (
          <CallBox key={idx} call={call} opacity={callIdx > 0 ? 0.3 : 1} />
        ))}
      </Flex>
      <Flex direction="column" gap={4} w="sm">
        {stackOrder.map((id) => (
          <ViewStackInfo id={id} />
        ))}
      </Flex>
    </Flex>
  );
}
