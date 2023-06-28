import { useParams } from "react-router";

export default function TipView() {
  const { tipId } = useParams();
  return <>Tip: {tipId}</>;
}
