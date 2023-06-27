import { Call, DANCER_MAP, FACING_MAP, Formation, Sequence } from "./types";

/** "Sat May  6 02:22:24 2023" */
function parseDate(date: string): Date {
  const [, month, day, hms, year] = date.split(" ").filter((s) => s !== "");
  const [hours, minutes, seconds] = hms.split(":").map(parseInt);

  const monthIndex = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  }[month];

  return new Date(
    parseInt(year),
    monthIndex ?? 0,
    parseInt(day),
    hours,
    minutes,
    seconds
  );
}

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

/** a block is a single call plus any info given about the call */
function parseBlock(block: string[]): Call {
  const [rawCall, ...rest] = block;

  // pull out a line-starting comment, if it exists
  const [comment, call] = (() => {
    const splits = rawCall.split(" } ");
    if (!rawCall.startsWith("{") || splits.length === 1) {
      return ["", rawCall];
    }
    const [head, ...tail] = splits;
    return [head.slice(2), tail.join(" } ")];
  })();

  const iter = rest.values();
  let line = iter.next();

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
  while (!line.done) {
    if (line.value.trim() !== "") {
      rawFormation.push(line.value);
    }
    line = iter.next();
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
      date: parseDate(dateStr),
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
