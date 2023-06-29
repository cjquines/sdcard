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
import { RefObject, useRef, useState } from "react";
import { Sequence } from "../lib/types";
import { actions, useTracked } from "../lib/store";
import { getCommonMetadata } from "../lib/metadata";
import { produce } from "immer";

function EditSeqs({ seqs }: { seqs: Sequence[] }) {
  const [metadata, setMetadata] = useState(getCommonMetadata(seqs));
  const categories = useTracked().db.categories();

  const addOption = (category: string, option: string) => {
    setMetadata(
      produce((metadata) => {
        metadata.categories[category] = option;
      })
    );
    actions.db.editSequences(
      seqs,
      { categories: { [category]: option } },
      true
    );
  };

  const removeOption = (category: string) => {
    setMetadata(
      produce((metadata) => {
        delete metadata.categories[category];
      })
    );
    actions.db.editSequences(seqs, { categories: { [category]: "" } }, false);
  };

  return (
    <>
      {Object.values(categories).map(({ category, comment, options }) => (
        <FormControl key={category} as="fieldset">
          <FormLabel as="legend">{category}</FormLabel>
          <RadioGroup
            value={metadata.categories[category]}
            onChange={(option) => addOption(category, option)}
          >
            {options.map((option) => (
              <Radio key={option} value={option}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
          <Button onClick={() => removeOption(category)}>clear</Button>
          <FormHelperText>{comment}</FormHelperText>
        </FormControl>
      ))}
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
