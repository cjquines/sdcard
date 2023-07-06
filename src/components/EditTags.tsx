import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
} from "@chakra-ui/react";
import { actions, useTracked } from "../lib/store";

export default function EditTags() {
  const categories = useTracked().db.categories();

  return (
    <Flex direction="column">
      TODO
      {Array.from(categories.values()).map(({ id, name, comment }) => {
        return (
          <Flex direction="column">
            <Editable
              value={name}
              onChange={(value) =>
                value !== "" &&
                actions.db.editCategory(id, (seq) => {
                  seq.name = value;
                })
              }
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
            <Editable
              color={comment === "" ? "gray.400" : "inherit"}
              placeholder="(add comment)"
              value={comment}
              onChange={(value) =>
                actions.db.editCategory(id, (seq) => {
                  seq.comment = value;
                })
              }
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </Flex>
        );
      })}
    </Flex>
  );
}
