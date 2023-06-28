import { Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { actions, useTracked } from "../lib/store";
import SequenceCard from "./SequenceCard";
import { ReactSortable } from "react-sortablejs";

export default function DBView() {
  const sequences = useTracked().db.sequences();
  const dances = useTracked().db.dances();

  return (
    <>
      <ReactSortable
        multiDrag
        animation={150}
        handle=".handle"
        list={sequences}
        setList={(newSequences) => actions.db.sequences(newSequences)}
      >
        {sequences.map((sequence) => (
          <SequenceCard key={sequence.id} seq={sequence} />
        ))}
      </ReactSortable>
      {dances.map((dance) => (
        <Link as={RouterLink} to={`dance/${dance.id}`}>
          {dance.comment} {dance.id}
        </Link>
      ))}
    </>
  );
}
