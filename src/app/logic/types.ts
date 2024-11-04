export type PentagonLine = 0 | 1 | 2 | 3 | 4;
export type Card = [PentagonLine, PentagonLine, PentagonLine];
export type Set = [Card, Card, Card, Card, Card];

export enum SymmetryType {
  AllSame,
  ThreeTwo,
  OneTwoTwo,
  Star,
}

export interface SymmetryGroup {
  cards: Set;
  symmetryTypes: [SymmetryType, SymmetryType, SymmetryType];
}
