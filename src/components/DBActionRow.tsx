import { AgGridReact } from "ag-grid-react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { produce } from "immer";
import { RefObject, useRef, useState } from "react";
import { Sequence } from "../lib/types";
import { EditMetadata } from "./SeqMetadata";
import { Metadata } from "../lib/metadata";
import { actions } from "../lib/store";

function EditSeqs({ gridRef }: { gridRef: RefObject<AgGridReact<Sequence>> }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  // we duplicate the state here, because reacting to multiple things is kinda
  // complicated
  const [seqs, setSeqs] = useState(new Array<Sequence>());
  const [seqMeta, setSeqMeta] = useState(Metadata.empty());

  const onEdit = () => {
    const newSeqs = gridRef.current?.api.getSelectedRows() ?? [];
    setSeqs(newSeqs);
    setSeqMeta(Metadata.intersect(newSeqs));
    onOpen();
  };

  const editBoth = (edit: (meta: Metadata) => void) => {
    setSeqMeta(produce((meta) => edit(meta)));
    seqs.forEach((seq) => actions.db.editSeq(seq.id, edit));
  };

  return (
    <>
      <Button ref={btnRef} onClick={onEdit}>
        Edit
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit {seqs.length} sequences</DrawerHeader>
          <DrawerBody>
            <EditMetadata meta={seqMeta} setMeta={editBoth} />
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
  gridRef: RefObject<AgGridReact<Sequence>>;
}) {
  return (
    <Flex gap={4}>
      <EditSeqs gridRef={gridRef} />
    </Flex>
  );
}
