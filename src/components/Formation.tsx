import { Formation } from "../lib/types";

function Formation({ formation }: { formation?: Formation }) {
  if (!formation) return null;
  const dancers = [...formation.entries()].map(
    ([dancer, { facing, row, col }]) => {
      return (
        <div
          key={dancer}
          style={{
            position: "absolute",
            top: `${row}em`,
            left: `${col}em`,
          }}
        >
          {dancer}
          {facing}
        </div>
      );
    }
  );
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {dancers}
    </div>
  );
}

export default Formation;
