import { Flex, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { actions, useTracked } from "../lib/store";
import { ViewSeqInfo } from "./SeqInfo";
import { StackId } from "../lib/types";
import { EditQueryInfo, ViewQueryInfo } from "./QueryInfo";

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

export function EditStackInfo({ id }: { id: StackId }) {
  const stack = useTracked().session.stacks().get(id);
  if (!stack) return null;
  const { query } = stack;

  return (
    <FormControl>
      <FormLabel>Query 1:</FormLabel>
      <EditQueryInfo
        query={query}
        setQuery={(query) =>
          actions.session.editStack(id, (stack) => {
            stack.query = query;
          })
        }
      />
    </FormControl>
  );
}
