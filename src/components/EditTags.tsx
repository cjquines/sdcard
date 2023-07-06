import {
  Button,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
} from "@chakra-ui/react";
import { actions, useTracked } from "../lib/store";
import { TagId } from "../lib/metadata";
import { nanoid } from "nanoid";
import SimpleModal from "./SimpleModal";

export default function EditTags() {
  const tags = useTracked().db.tags();

  const onDelete = (id: TagId) => () =>
    actions.db.state((state) => {
      state.sequences.forEach((seq) => {
        seq.tags.delete(id);
      });
      state.tags.delete(id);
    });

  const onAdd = () =>
    actions.db.state((state) => {
      const id = TagId(nanoid());
      state.tags.set(id, { id, name: "(new)", comment: "" });
    });

  return (
    <Flex direction="column" gap={4}>
      {Array.from(tags.values()).map(({ id, name, comment }) => (
        <>
          <Flex direction="column" gap={2}>
            <Flex gap={2}>
              <Editable
                flex={1}
                value={name}
                onChange={(value) =>
                  value !== "" &&
                  actions.db.editTag(id, (tag) => {
                    tag.name = value;
                  })
                }
              >
                <EditablePreview />
                <EditableInput />
              </Editable>
              <SimpleModal
                size="sm"
                variant="outline"
                open="Delete"
                title="Delete tag"
                confirm="Delete"
                onConfirm={onDelete(id)}
              >
                Are you sure you want to delete the tag {name}?
              </SimpleModal>
            </Flex>
            <Editable
              color={comment === "" ? "gray.400" : "inherit"}
              placeholder="(add comment)"
              value={comment}
              onChange={(value) =>
                actions.db.editTag(id, (tag) => {
                  tag.comment = value;
                })
              }
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
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
