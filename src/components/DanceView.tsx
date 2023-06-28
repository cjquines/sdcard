import { useParams } from "react-router";

export default function DanceView() {
  const { danceId } = useParams();
  return <>Dance: {danceId}</>;
}
