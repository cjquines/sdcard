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
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { produce } from "immer";
import { RefObject, useRef, useState } from "react";
import { Sequence } from "../lib/types";
import { EditMetadata } from "./SeqMetadata";
import { Metadata } from "../lib/metadata";
import { actions } from "../lib/store";
import EditCategories from "./EditCategories";
import EditTags from "./EditTags";
import SimpleModal from "./SimpleModal";

function EditSeqsBtn({
  gridRef,
}: {
  gridRef: RefObject<AgGridReact<Sequence>>;
}) {
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
        Edit sequences
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        placement="right"
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

function DeleteSeqsBtn({
  gridRef,
}: {
  gridRef: RefObject<AgGridReact<Sequence>>;
}) {
  const [seqs, setSeqs] = useState(new Array<Sequence>());

  const beforeOpen = () =>
    setSeqs(gridRef.current?.api.getSelectedRows() ?? []);

  const onConfirm = () =>
    actions.db.state((state) => {
      seqs.forEach((seq) => state.sequences.delete(seq.id));
    });

  return (
    <SimpleModal
      open="Delete sequences"
      beforeOpen={beforeOpen}
      title={`Delete ${seqs.length} sequences`}
      confirm="Delete"
      onConfirm={onConfirm}
    >
      Are you sure you want to delete {seqs.length} sequences?
    </SimpleModal>
  );
}

function EditCategoriesBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={btnRef} onClick={onOpen}>
        Edit categories
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        placement="right"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit categories</DrawerHeader>
          <DrawerBody>
            <EditCategories />
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={onClose}>Return</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function EditTagsBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={btnRef} onClick={onOpen}>
        Edit tags
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        placement="right"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit tags</DrawerHeader>
          <DrawerBody>
            <EditTags />
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
    <Flex gap={2}>
      <EditSeqsBtn gridRef={gridRef} />
      <DeleteSeqsBtn gridRef={gridRef} />
      <Spacer />
      <EditCategoriesBtn />
      <EditTagsBtn />
    </Flex>
  );
}
