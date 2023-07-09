import { Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { actions, useTracked } from "../lib/store";
import { ViewSeqInfo } from "./SeqInfo";
import { ViewQueryInfo } from "./QueryInfo";
import { StackId } from "../lib/session";

export function ViewStackInfo({ id }: { id: StackId }) {
  const stack = useTracked().session.stacks().get(id);
  const top = useTracked().session.topOf(id);
  const navigate = useNavigate();
  if (!stack) return null;
  const { name, query, sequences, index } = stack;

  const onClick = () => {
    const next = actions.session.pullFrom(id);
    if (next) {
      navigate(`/sequence/${next}`);
    }
  };

  return (
    <Flex direction="column">
      <Text>{name}</Text>
      <ViewQueryInfo query={query} />
      <Text>
        {index + 1} of {sequences.length}
      </Text>
      {top ? <ViewSeqInfo id={top} onClick={onClick} /> : <Text>(empty)</Text>}
    </Flex>
  );
}
