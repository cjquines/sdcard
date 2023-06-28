import { Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useTracked } from "../lib/store";

export default function DB() {
  const sequences = useTracked().db.sequences();
  const dances = useTracked().db.dances();

  return (
    <>
      {sequences.map((sequence) => (
        <>{sequence.id}</>
      ))}
      {dances.map((dance) => (
        <Link as={RouterLink} to={`dance/${dance.id}`}>
          {dance.comment} {dance.id}
        </Link>
      ))}
    </>
  );
}
