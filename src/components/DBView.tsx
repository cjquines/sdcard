import { Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import SequenceCard from "./SequenceCard";
import { useTracked } from "../lib/store";

export default function DBView() {
  const sequences = useTracked().db.sequences();

  return (
    <>
      {sequences.map((sequence) => (
        <Link as={RouterLink} to={`TODO`}>
          <SequenceCard key={sequence.id} seq={sequence} />
        </Link>
      ))}
    </>
  );
}
