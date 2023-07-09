import { Brand, make as makeBrander } from "ts-brand";
import { TagId } from "./metadata";
import { Query } from "./search";
import { Sequence, SequenceId } from "./types";

/**
 * A stack of cards is a query of matching sequences, plus an index into a
 * list of sequences.
 */
export type Stack = {
  readonly id: Brand<string, "StackId">;
  name: string;
  query: Query;
  sequences: SequenceId[];
  /**
   * Shows the *next sequence* we would show from this stack. In particular,
   * if this is the current stack, we'd be showing sequences[index - 1].
   */
  index: number;
};

export type StackId = Stack["id"];
export const StackId = makeBrander<StackId>();

/** A Session represents session-local state. */
export type Session = {
  /** Add this tag to all sequences we view. */
  autoTag: TagId | null;
  /** Is there an ongoing "session"? */
  ongoing: boolean;
  /** The global query. */
  query: Query;
  /** The stacks of sequences. */
  stacks: Map<StackId, Stack>;
  /** The order of the stacks. */
  stackOrder: StackId[];
};

/** silly difficulty/weirdness heuristic */
export function score(sequence: Sequence) {
  const { calls, comment } = sequence;
  let score = 0;
  // score for length of sequence
  score += 2 * calls.length;
  const comments = calls.map((call) => call.comment);
  // score for proportion of calls with comments
  score += (3 * comments.length) / calls.length;
  // score for max length of comments
  score += Math.max(...comments.map((comment) => comment.length)) / 10;
  const callText = calls.map((call) => call.call);
  // score for proportion of calls with capital letters
  score +=
    (5 * callText.filter((text) => text.toLowerCase() !== text).length) /
    calls.length;
  const has45 = calls.some((call) => call.rotated45);
  // score if there's 45
  score += has45 ? 5 : 0;
  const warnings = calls.flatMap((call) => call.warnings);
  // score for each warning
  score += 2 * warnings.length;
  // multiplier for hardness / weirdness
  for (const note of ["hard", "very hard", "weird"]) {
    if (comment.toLowerCase().includes(note)) {
      score *= 1.5;
    }
  }
  return score;
}

/**
 * Distribute and sort the sequences into stacks, according to matching
 * queries. Mutates stacks.
 */
export function distribute(sequences: Sequence[], stacks: Map<StackId, Stack>) {
  const seqs = sequences
    .map((seq) => ({
      seq,
      stacks: Array.from(stacks.values())
        .filter(({ query }) => Query.pass(query, seq))
        .map(({ id }) => id),
    }))
    .filter(({ stacks }) => stacks.length > 0);

  // try to distribute equally
  const stackSeqs = new Map<StackId, Sequence[]>(
    Array.from(stacks.values()).map(({ id }) => [id, []]),
  );
  for (const { seq, stacks } of seqs) {
    stackSeqs
      .get(
        stacks.reduce<StackId>((acc, cur) => {
          return (stackSeqs.get(cur)?.length ?? 0) <
            (stackSeqs.get(acc)?.length ?? 1)
            ? cur
            : acc;
        }, stacks[0]),
      )
      ?.push(seq);
  }

  // resort by dissimilar scores
  stackSeqs.forEach((seqs, id) => {
    const sorted = seqs
      .map<[Sequence, number]>((seq) => [seq, score(seq)])
      .sort((a, b) => b[1] - a[1])
      .map((a) => a[0]);

    const first = sorted.slice(sorted.length / 2);
    const second = sorted.slice(0, sorted.length / 2);

    while (first.length > 0 || second.length > 0) {
      let seq = first.pop();
      if (seq) {
        stacks.get(id)?.sequences.push(seq.id);
      }
      seq = second.pop();
      if (seq) {
        stacks.get(id)?.sequences.push(seq.id);
      }
    }
  });
}
