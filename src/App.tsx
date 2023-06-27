import { FormEventHandler, useRef, useState } from "react";

import "./App.css";
import { parseFile } from "./lib/parser";
import { Sequence } from "./lib/types";
import Formation from "./components/Formation";

function App() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [seqIndex, setSeqIndex] = useState(0);
  const [callIndex, setCallIndex] = useState(0);
  const sequence = sequences[seqIndex];
  const call = sequence?.calls[callIndex];

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      setSequences(parseFile(text));
    });
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label>
          upload:
          <input type="file" ref={fileInput} />
        </label>
        <button type="submit">submit</button>
      </form>
      <ul>
        {sequences.map(({ date, comment }, i) => (
          <li key={date.toString()}>
            <button
              onClick={() => {
                setSeqIndex(i);
                setCallIndex(0);
              }}
            >
              sequence {i}: {comment}, {date.toString()}
            </button>
          </li>
        ))}
      </ul>
      {!sequence || !call ? null : (
        <div>
          <div>
            call {callIndex}: {call.call}
          </div>
          <button onClick={() => setCallIndex(callIndex - 1)}>prev</button>
          <button onClick={() => setCallIndex(callIndex + 1)}>next</button>
          <Formation formation={call.formation} />
        </div>
      )}
    </>
  );
}

export default App;
