import { Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { actions, useTracked } from "../lib/store";
import { ViewSeqInfo } from "./SeqInfo";

export default function StackView({ idx }: { idx: number }) {
  const stack = useTracked().session.stacks()[idx];
  const navigate = useNavigate();

  if (!stack) return null;

  const { name, sequences, index } = stack;

  const onClick = () => {
    actions.session.rotate(idx);
    const next = actions.session.pop();
    if (next) {
      navigate(`/sequence/${next}`);
    }
  };

  return (
    <Flex direction="column">
      <Text>{name}</Text>
      <Text>
        {index + 1} of {sequences.length}
      </Text>
      {index < sequences.length ? (
        <ViewSeqInfo seq={sequences[index]} onClick={onClick} />
      ) : (
        <Text>(empty)</Text>
      )}
    </Flex>
  );
}
