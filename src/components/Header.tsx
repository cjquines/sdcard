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
import SimpleModal from "./SimpleModal";
import TagSelect from "./TagSelect";
import { EditQueryInfo } from "./QueryInfo";
import EditStacks from "./EditStacks";

function SessionModal() {
  const navigate = useNavigate();
  const autoTag = useTracked().session.autoTag();
  const ongoing = useTracked().session.ongoing();

  const onStop = () => actions.session.ongoing(false);
  const onConfirm = () => {
    const topSeq = actions.session.init();
    if (topSeq) {
      navigate(`/sequence/${topSeq}`);
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
        <EditStacks />
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
  const query = useTracked().session.query();
  const setQuery = actions.session.query;

  return (
    <Flex as="header" justify="center" w="100%" shadow="sm">
      <Flex align="center" flex="1" maxW="8xl" m="3" gap="3">
        <Heading as="h1" size="md" mx="5">
          <Link as={RouterLink} to="/">
            sdcard
          </Link>
        </Heading>
        <EditQueryInfo query={query} setQuery={setQuery} />
        <SessionModal />
        <ImportModal />
      </Flex>
    </Flex>
  );
}
