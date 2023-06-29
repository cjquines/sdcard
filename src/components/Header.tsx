import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useMultiStyleConfig,
} from "@chakra-ui/react";
import { FormEventHandler, useRef, useState } from "react";
import { actions } from "../lib/store";
import { Link as RouterLink } from "react-router-dom";

function ImportModal() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [newSeqs, setNewSeqs] = useState<number>();
  const [importing, setImporting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const styles = useMultiStyleConfig("Button");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setImporting(true);
    Promise.all(
      Array.from(fileInput.current?.files ?? []).map((file) =>
        actions.db.importSequences(file)
      )
    ).then((seqs) => {
      setNewSeqs(seqs.reduce((x, y) => x + y, 0));
      setImporting(false);
    });
  };

  return (
    <>
      <Button m="3" onClick={onOpen}>
        Import sequences
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import sequences</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmit}>
              <FormControl>
                <FormLabel>Choose SD files to import:</FormLabel>
                <Input
                  type="file"
                  border="none"
                  p="0"
                  sx={{
                    "::file-selector-button": {
                      ...styles,
                      border: "none",
                      outline: "none",
                    },
                    "::file-selector-button:hover": {
                      cursor: "pointer",
                      background: "gray.200",
                    },
                  }}
                  ref={fileInput}
                  multiple
                />
              </FormControl>
              {importing ? (
                "Importing..."
              ) : (
                <Button mt="4" type="submit">
                  Import
                </Button>
              )}
            </form>
            {newSeqs !== undefined ? `${newSeqs} sequences added.` : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Return</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Header() {
  return (
    <>
      <Flex as="header" align="center" w="100%" maxW="8xl" shadow="sm">
        <Heading as="h1" size="md" mx="8">
          <Link as={RouterLink} to="/">
            sdcard
          </Link>
        </Heading>
        <ImportModal />
      </Flex>
    </>
  );
}
