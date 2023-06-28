import { useParams } from "react-router";

export default function Dance() {
  const { danceId } = useParams();
  return <>Dance: {danceId}</>;
}
