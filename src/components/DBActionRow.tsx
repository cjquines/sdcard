import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  useDisclosure,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { RefObject, useRef, useState } from "react";
import { ActionMeta } from "chakra-react-select";
import { produce } from "immer";
import { Sequence } from "../lib/types";
import { actions, useTracked } from "../lib/store";
import { CategoryOption, Metadata } from "../lib/metadata";
import TagSelect, { TagOption } from "./TagSelect";
import DBSearch from "./DBSearch";

function EditSeqs({ seqs }: { seqs: Sequence[] }) {
  const [seqMeta, setSeqMeta] = useState(Metadata.intersect(seqs));
  const categories = useTracked().db.categories();

  const editBoth = (edit: (meta: Metadata) => void) => {
    setSeqMeta(produce((meta) => edit(meta)));
    actions.db.state((state) =>
      seqs.forEach((seq) => {
        const sequence = state.sequences.get(seq.id);
        if (sequence) edit(sequence);
      })
    );
  };

  const onChangeTags = (action: ActionMeta<TagOption>) => {
    switch (action.action) {
      case "select-option": {
        return editBoth((meta) => {
          if (action.option) {
            Metadata.addTag(meta, action.option.value);
          }
        });
      }
      case "pop-value":
      case "remove-value": {
        return editBoth((meta) => {
          if (action.removedValue) {
            Metadata.removeTag(meta, action.removedValue.value);
          }
        });
      }
      case "clear": {
        return editBoth((meta) => {
          Metadata.edit(
            meta,
            { tags: new Set(action.removedValues.map(({ value }) => value)) },
            false
          );
        });
      }
    }
  };

  return (
    <>
      {Array.from(categories.values()).map(({ category, comment, options }) => (
        <FormControl key={category} as="fieldset">
          <FormLabel as="legend">{category}</FormLabel>
          <RadioGroup
            value={seqMeta.categories.get(category)}
            onChange={(option: CategoryOption) =>
              editBoth((meta) => Metadata.addOption(meta, category, option))
            }
          >
            <HStack>
              {options.map((option) => (
                <Radio key={option} value={option}>
                  {option}
                </Radio>
              ))}
              <Button
                onClick={() =>
                  editBoth((meta) => Metadata.removeOption(meta, category))
                }
                size="sm"
                variant="outline"
              >
                Clear
              </Button>
            </HStack>
          </RadioGroup>
          <FormHelperText>{comment}</FormHelperText>
        </FormControl>
      ))}
      <FormControl>
        <FormLabel>Tags</FormLabel>
        <TagSelect initialTags={seqMeta.tags} onChange={onChangeTags} />
      </FormControl>
    </>
  );
}

function Edit({ gridRef }: { gridRef: RefObject<AgGridReact> }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [seqs, setSeqs] = useState<Sequence[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  const onEdit = () => {
    setSeqs(gridRef.current?.api.getSelectedRows() ?? []);
    onOpen();
  };

  return (
    <>
      <Button ref={btnRef} onClick={onEdit}>
        Edit
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="xs"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit {seqs.length} sequences</DrawerHeader>
          <DrawerBody>
            <EditSeqs seqs={seqs} />
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={onClose}>Return</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default function DBActionRow({
  gridRef,
}: {
  gridRef: RefObject<AgGridReact>;
}) {
  return (
    <Box>
      <Edit gridRef={gridRef} />
      <DBSearch />
    </Box>
  );
}
