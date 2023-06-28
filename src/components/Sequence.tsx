import { useParams } from "react-router";

export default function Sequence() {
  const { seqId } = useParams();
  return <>Sequence: {seqId}</>;
}
