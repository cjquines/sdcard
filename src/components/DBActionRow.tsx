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
import { AgGridReact } from "ag-grid-react";
import { RefObject, useRef, useState } from "react";
import { Sequence } from "../lib/types";
import DBSearch from "./DBSearch";
import SeqsMetadata from "./SeqsMetadata";

function Edit({ gridRef }: { gridRef: RefObject<AgGridReact<Sequence>> }) {
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
        size="sm"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit {seqs.length} sequences</DrawerHeader>
          <DrawerBody>
            <SeqsMetadata seqs={seqs} />
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
      <Edit gridRef={gridRef} />
      <DBSearch gridRef={gridRef} />
    </Flex>
  );
}
