import {
  Button,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
} from "@chakra-ui/react";
import { actions, useTracked } from "../lib/store";
import { nanoid } from "nanoid";
import { StackId } from "../lib/session";
import { EditQueryInfo } from "./QueryInfo";

export default function EditStacks() {
  const stacks = useTracked().session.stacks();
  const stackOrder = useTracked().session.stackOrder();

  const onDelete = (id: StackId) => () =>
    actions.session.state((state) => {
      state.stacks.delete(id);
      const idx = state.stackOrder.findIndex((id_) => id_ === id);
      if (idx !== -1) {
        state.stackOrder.splice(-1, 1);
      }
    });

  const onAdd = () =>
    actions.session.state((state) => {
      const id = StackId(nanoid());
      state.stacks.set(id, {
        id,
        name: "(new)",
        query: [],
        sequences: [],
        index: 0,
      });
      state.stackOrder.push(id);
    });

  return (
    <Flex direction="column" gap={4}>
      {stackOrder
        .flatMap((id) => {
          const res = stacks.get(id);
          return res ? [res] : [];
        })
        .map(({ id, name, query }) => (
          <>
            <Flex direction="column" gap={2}>
              <Flex gap={2}>
                <Editable
                  flex={1}
                  value={name}
                  onChange={(value) =>
                    value !== "" &&
                    actions.session.editStack(id, (stack) => {
                      stack.name = value;
                    })
                  }
                >
                  <EditablePreview />
                  <EditableInput />
                </Editable>
                <Button size="sm" variant="outline" onClick={onDelete(id)}>
                  Delete
                </Button>
              </Flex>
              <EditQueryInfo
                query={query}
                setQuery={(query) =>
                  actions.session.editStack(id, (stack) => {
                    stack.query = query;
                  })
                }
              />
            </Flex>
            <Divider />
          </>
        ))}
      <Button onClick={onAdd} mt={2}>
        Add
      </Button>
    </Flex>
  );
}
