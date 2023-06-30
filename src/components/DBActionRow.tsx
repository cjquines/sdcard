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
  Radio,
  RadioGroup,
  useDisclosure,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { RefObject, useMemo, useRef, useState } from "react";
import { Sequence } from "../lib/types";
import { actions, useTracked } from "../lib/store";
import { CategoryOption, Metadata } from "../lib/metadata";
import { produce } from "immer";
import { Select } from "chakra-react-select";

function EditSeqs({ seqs }: { seqs: Sequence[] }) {
  const [seqMeta, setSeqMeta] = useState(Metadata.intersect(seqs));
  const categories = useTracked().db.categories();
  const tags = useTracked().db.tags();

  const editBoth = (edit: (meta: Metadata) => void) => {
    setSeqMeta(produce((meta) => edit(meta)));
    actions.db.state((state) =>
      seqs.forEach((seq) => {
        const sequence = state.sequences.get(seq.id);
        if (sequence) edit(sequence);
      })
    );
  };

  const tagOptions = useMemo(
    () =>
      Array.from(tags.values()).map(({ tag, comment }) => ({
        value: tag,
        label: `${tag}${comment ? ` (${comment})` : ""}`,
      })),
    [tags]
  );

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
            {options.map((option) => (
              <Radio key={option} value={option}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
          <Button
            onClick={() =>
              editBoth((meta) => Metadata.removeOption(meta, category))
            }
          >
            clear
          </Button>
          <FormHelperText>{comment}</FormHelperText>
        </FormControl>
      ))}
      <FormControl>
        <FormLabel>Tags</FormLabel>
        <Select
          closeMenuOnSelect={false}
          isMulti={true}
          options={tagOptions}
          defaultValue={tagOptions.filter(({ value }) =>
            seqMeta.tags.has(value)
          )}
          isOptionSelected={({ value }) => seqMeta.tags.has(value)}
          onChange={(_, action) => {
            switch (action.action) {
              case "select-option": {
                editBoth((meta) => {
                  if (action.option) {
                    Metadata.addTag(meta, action.option.value);
                  }
                });
                break;
              }
              case "pop-value":
              case "remove-value": {
                editBoth((meta) => {
                  Metadata.removeTag(meta, action.removedValue.value);
                });
                break;
              }
              case "clear": {
                editBoth((meta) => {
                  Metadata.edit(
                    meta,
                    {
                      tags: new Set(
                        action.removedValues.map(({ value }) => value)
                      ),
                    },
                    false
                  );
                });
                break;
              }
            }
          }}
        />
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
      <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef}>
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
    </Box>
  );
}
