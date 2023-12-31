import { nanoid } from "nanoid";
import {
  Call,
  DANCER_MAP,
  FACING_MAP,
  Formation,
  LEVEL_MAP,
  Level,
  Sequence,
  SequenceId,
} from "./types";
import { parseDate } from "./dates";

/** split across \n\n kinda */
function chunkBlocks(lines: string[]): string[][] {
  const result: string[][] = [[]];
  for (const line of lines) {
    if (line !== "" && !line.startsWith(" ")) {
      result.push([line]);
    } else {
      result.at(-1)?.push(line);
    }
  }
  return result;
}

/** parse the block of comments */
function parseComment(commentBlock: string[]): string {
  return commentBlock.filter((line) => line.trim() !== "")[0]?.trim() ?? "";
}

/**
 * parse a formation block like
 *
 *       2B>
 * 1B<   4G<   1G>
 * 3G<   2G>   3B>
 *       4B<
 *
 * in the ideal world we would map people to slots in a named formation, maybe
 */
function parseFormation(rawFormation: string[]): Formation | undefined {
  const formation: Partial<Formation> = {};
  rawFormation.forEach((line, row) => {
    line.split("").forEach((char, col) => {
      const facing = FACING_MAP.get(char);
      if (!facing) return;
      const dancer = DANCER_MAP.get(line.slice(col - 2, col));
      if (!dancer) return;
      formation[dancer] = { facing, row, col };
    });
  });

  // check the existence of each dancer
  const missing = Array.from(DANCER_MAP.values()).filter(
    (dancer) => !formation[dancer],
  );
  if (missing.length > 0) {
    if (missing.length < DANCER_MAP.size) {
      console.error("some dancers can't be found?");
    }
    return undefined;
  }

  return formation as Formation;
}

/** a block is a single call plus any info given about the call */
function parseBlock(block: string[]): Call {
  const iter = block.values();
  let line = iter.next();

  // get the lines of the call
  const callLines = [line.value];
  line = iter.next();
  while (!line.done && line.value.startsWith("   ")) {
    callLines.push(line.value.trim());
    line = iter.next();
  }

  // pull out a line-starting comment, if it exists
  const [comment, call] = (() => {
    const rawCall = callLines.join(" ");
    const splits = rawCall.split(" } ");
    if (!rawCall.startsWith("{") || splits.length === 1) {
      return ["", rawCall];
    }
    const [head, ...tail] = splits;
    return [head.slice(2), tail.join(" } ")];
  })();

  // check for warnings
  const warnings = [];
  while (!line.done && line.value.includes("Warning")) {
    const warning = [line.value];
    // keep getting the next lines that start with "   "
    line = iter.next();
    while (!line.done && line.value.startsWith("   ")) {
      warning.push(line.value.trim());
      line = iter.next();
    }
    warnings.push(warning.join(" "));
  }

  // get formation image, if it exists
  const rawFormation = [];
  while (!line.done && !line.value.includes("45 degrees")) {
    if (line.value.trim() !== "") {
      rawFormation.push(line.value);
    }
    line = iter.next();
  }

  // if we have a note...
  const rotated45 = !line.done && line.value.includes("45 degrees");

  return {
    comment,
    call,
    warnings,
    formation: parseFormation(rawFormation),
    rotated45,
  };
}

function parseSequence(seqStr: string): Sequence {
  const [headerStr, ...body] = seqStr.replace(/\r/g, "").trim().split("\n");
  const [dateStr, version, levelStr] = headerStr.split("     ");
  const [commentBlock, ...blocks] = chunkBlocks(body);
  const level = LEVEL_MAP.get(levelStr) ?? Level.ALL;

  return {
    id: SequenceId(nanoid()),
    date: parseDate(dateStr),
    version,
    level,
    comment: parseComment(commentBlock),
    calls: blocks.map(parseBlock),
    categories: new Map(),
    tags: new Set(),
  };
}

export function parseFile(file: string): Sequence[] {
  return file.split("\x0c").map(parseSequence);
}
