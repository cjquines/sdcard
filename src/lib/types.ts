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

export enum Facing {
  BACK = "^",
  LEFT = "<",
  FRONT = "V",
  RIGHT = ">",
}

export const FACING_MAP = new Map<string, Facing>(
  Object.values(Facing).map((val) => [`${val}`, val] as const)
);

export type Position = {
  facing: Facing;
  row: number;
  col: number;
};

export type Formation = Map<Dancer, Position>;

export type Call = {
  call: string;
  comment: string;
  warnings: string[];
  formation: Formation;
};

export type Sequence = {
  header: {
    date: Date;
    version: string;
    level: string;
  };
  comment: string;
  calls: Call[];
};
