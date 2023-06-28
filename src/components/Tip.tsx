import { useParams } from "react-router";

export default function Tip() {
  const { tipId } = useParams();
  return <>Tip: {tipId}</>;
}
