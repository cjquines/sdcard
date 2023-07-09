import { Brand, make as makeBrander } from "ts-brand";
import { Category, CategoryId, Metadata, Tag, TagId } from "./metadata";

/** A dancer is one of the eight people in the square. */
export enum Dancer {
  B1 = "1B",
  G1 = "1G",
  B2 = "2B",
  G2 = "2G",
  B3 = "3B",
  G3 = "3G",
  B4 = "4B",
  G4 = "4G",
}

export const DANCER_MAP = new Map<string, Dancer>(
  Object.values(Dancer).map((val) => [`${val}`, val] as const),
);
export const isDancer = (s: string): s is Dancer => DANCER_MAP.has(s);

/** Facing position; couple #1 starts facing BACK, #2 facing LEFT, etc. */
export enum Facing {
  BACK = "^",
  LEFT = "<",
  FRONT = "V",
  RIGHT = ">",
}

export const FACING_MAP = new Map<string, Facing>(
  Object.values(Facing).map((val) => [`${val}`, val] as const),
);
export const isFacing = (s: string): s is Facing => FACING_MAP.has(s);

/** A dancer's position has a direction (facing) and a location (row/col). */
export type Position = {
  facing: Facing;
  row: number;
  col: number;
};

/**
 * A formation is a map from each dancer to their position. All dancers should
 * have a mapped position.
 */
export type Formation = { [dancer in Dancer]: Position };

/** A call is all the information SD gives us about a call. */
export type Call = {
  /** The call itself, without any leading comments, as printed by SD. */
  call: string;
  /** Leading comment, if it exists, otherwise "". */
  comment: string;
  /** List of warnings SD gives. */
  warnings: string[];
  /** Formation picture, if SD printed it. */
  formation?: Formation;
  /** Is the actual formation rotated 45 degrees clockwise? */
  rotated45: boolean;
};

/** A level, as defined by what SD prints as a level header. */
export enum Level {
  MS = "MS",
  PLUS = "Plus",
  A1 = "A1",
  A2 = "A2",
  C1 = "C1",
  C2 = "C2",
  C3A = "C3A",
  C3 = "C3B",
  C4 = "C4",
  ALL = "all",
}

export const LEVEL_MAP = new Map<string, Level>(
  Object.values(Level).map((val) => [`${val}`, val] as const),
);
export const isLevel = (s: string): s is Level => LEVEL_MAP.has(s);

/** A raw sequence is a group of calls SD exports. */
type RawSequence = {
  /** ID assigned when we first import the sequence. */
  readonly id: Brand<string, "SequenceId">;
  /** Date sequence is exported by SD, as millis since Unix epoch. */
  date: number;
  version: string;
  level: Level;
  comment: string;
  calls: Call[];
};

export type SequenceId = RawSequence["id"];
export const SequenceId = makeBrander<SequenceId>();

/** A sequence is a sequence tagged with metadata. */
export type Sequence = RawSequence & Metadata;

/** A DB represents a physical database file. */
export type DB = {
  name: string;
  comment: string;
  sequences: Map<SequenceId, Sequence>;
  categories: Map<CategoryId, Category>;
  tags: Map<TagId, Tag>;
};
