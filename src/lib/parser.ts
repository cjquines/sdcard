import { parse as parseDate } from "date-fns";
import { Call, DANCER_MAP, FACING_MAP, Formation, Sequence } from "./types";

function chunkBlocks(lines: string[]): string[][] {
  return lines.reduce<string[][]>(
    (acc, cur) => {
      if (cur !== "" && !cur.startsWith(" ")) {
        return [...acc, [cur]];
      }
      const [tail, ...rhead] = acc.slice().reverse();
      return [...rhead.reverse(), [...tail, cur]];
    },
    [[]]
  );
}

function parseComment(commentBlock: string[]): string {
  return commentBlock.filter((line) => line.trim() !== "")[0]?.trim() ?? "";
}

function parseFormation(rawFormation: string[]): Formation {
  console.log(rawFormation);
  const formation: Formation = new Map();
  rawFormation.forEach((line, row) => {
    line.split("").forEach((char, col) => {
      const facing = FACING_MAP.get(char);
      if (!facing) return;
      const dancer = DANCER_MAP.get(line.slice(col - 2, col));
      if (!dancer) return;
      formation.set(dancer, { facing, row, col });
    });
  });
  console.log(formation);
  return formation;
}

function parseBlock(block: string[]): Call {
  const [rawCall, ...rest] = block.reduce<string[]>((acc, cur) => {
    if (acc.length > 0) {
      const [tail, ...rhead] = acc.slice().reverse();
      // TODO: super sketchy, fix this
      if (cur.startsWith("   ") && !/[1234 ]/.test(cur[3])) {
        return [...rhead.reverse(), tail + " " + cur.trim()];
      }
      return [...rhead.reverse(), tail, cur];
    }
    return [cur];
  }, []);

  const [comment, call] = (() => {
    const splits = rawCall.split(" } ");
    if (!rawCall.startsWith("{") || splits.length === 1) {
      return ["", rawCall];
    }
    const [head, ...tail] = splits;
    return [head.slice(2), tail.join(" } ")];
  })();

  const warnings = [];
  const rawFormation = [];
  for (const line of rest) {
    if (line.includes("Warning")) {
      warnings.push(line.trim());
    } else if (line.trim() !== "") {
      rawFormation.push(line);
    }
  }

  return {
    comment,
    call,
    warnings,
    formation: parseFormation(rawFormation),
  };
}

function parseSequence(seqStr: string): Sequence {
  const [headerStr, ...body] = seqStr.trim().split("\n");
  const [dateStr, version, level] = headerStr.split("     ");
  const [commentBlock, ...blocks] = chunkBlocks(body);

  return {
    header: {
      date: parseDate(dateStr, "EEE MMM dd HH:mm:ss yyyy", new Date()),
      version,
      level,
    },
    comment: parseComment(commentBlock),
    calls: blocks.map(parseBlock),
  };
}

export function parseFile(file: string): Sequence[] {
  return file.split("\x0c").map(parseSequence);
}
