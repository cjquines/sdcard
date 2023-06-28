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
  Object.values(Dancer).map((val) => [`${val}`, val] as const)
);

/** Facing position; couple #1 starts facing BACK, #2 facing LEFT, etc. */
export enum Facing {
  BACK = "^",
  LEFT = "<",
  FRONT = "V",
  RIGHT = ">",
}

export const FACING_MAP = new Map<string, Facing>(
  Object.values(Facing).map((val) => [`${val}`, val] as const)
);

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
export type Formation = Map<Dancer, Position>;

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
  C1 = "A1",
  C2 = "C2",
  C3A = "C3A",
  C3 = "C3B",
  C4 = "C4",
  ALL = "all",
}

export const LEVEL_MAP = new Map<string, Level>(
  Object.values(Level).map((val) => [`${val}`, val] as const)
);

/** A sequence is a group of calls SD exports. */
export type Sequence = {
  id: string;
  date: Date;
  version: string;
  level: Level;
  comment: string;
  calls: Call[];
};

/** A tip is a list of sequences. */
export type Tip = {
  id: string;
  comment: string;
  sequences: Sequence[];
};

/** A dance is a list of tips. */
export type Dance = {
  id: string;
  comment: string;
  tips: Tip[];
  sequences: Sequence[];
};

/** A file represents a physical database file. */
export type File = {
  id: string;
  name: string;
  comment: string;
  dances: Dance[];
  /** Tips not organized into dances. */
  tips: Tip[];
  /** Sequences not organized into tips. */
  sequences: Sequence[];
};
