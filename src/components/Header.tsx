import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  useMultiStyleConfig,
} from "@chakra-ui/react";
import { FormEventHandler, useRef, useState } from "react";
import { actions, useTracked } from "../lib/store";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import DBSearch from "./DBSearch";
import SimpleModal from "./SimpleModal";
import TagSelect from "./TagSelect";

function SessionModal() {
  const navigate = useNavigate();
  const autoTag = useTracked().session.autoTag();
  const ongoing = useTracked().session.ongoing();
  const stack = useTracked().session.stacks();

  const onStop = actions.session.stop;
  const onConfirm = () => {
    actions.session.init();
    const seq = actions.session.pop(0);
    if (seq) {
      navigate(`/sequence/${seq.id}`);
    }
  };

  return (
    <SimpleModal
      open={ongoing ? "View session" : "Start session"}
      title={ongoing ? "Session info" : "Start session"}
      confirm={ongoing ? "Stop" : "Start"}
      onConfirm={ongoing ? onStop : onConfirm}
    >
      <Flex direction="column" gap={2}>
        <FormControl>
          <FormLabel>Auto-tag:</FormLabel>
          <TagSelect rawValue={autoTag} onChange={actions.session.autoTag} />
        </FormControl>
        <FormControl>
          <FormLabel>Query 1:</FormLabel>
          <DBSearch idx={0} />
        </FormControl>
        {stack[0]?.length} sequences left
      </Flex>
    </SimpleModal>
  );
}

function ImportModal() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [newSeqs, setNewSeqs] = useState<number>();
  const [importing, setImporting] = useState(false);
  const styles = useMultiStyleConfig("Button");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setImporting(true);
    Promise.all(
      Array.from(fileInput.current?.files ?? []).map((file) =>
        actions.db.importSequences(file),
      ),
    ).then((seqs) => {
      setNewSeqs(seqs.reduce((x, y) => x + y, 0));
      setImporting(false);
    });
  };

  return (
    <SimpleModal
      open="Import sequences"
      title="Import sequences"
      cancel="Return"
    >
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
    </SimpleModal>
  );
}

export default function Header() {
  return (
    <Flex as="header" justify="center" w="100%" shadow="sm">
      <Flex align="center" flex="1" maxW="8xl" m="3" gap="3">
        <Heading as="h1" size="md" mx="5">
          <Link as={RouterLink} to="/">
            sdcard
          </Link>
        </Heading>
        <DBSearch idx={0} />
        <SessionModal />
        <ImportModal />
      </Flex>
    </Flex>
  );
}
