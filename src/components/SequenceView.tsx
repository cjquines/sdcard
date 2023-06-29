import { useParams } from "react-router";

export default function SequenceView() {
  const { seqId } = useParams();

  return <>Sequence: {seqId}</>;
}
