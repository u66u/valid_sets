// types.ts
export type PentagonLine = 0 | 1 | 2 | 3 | 4; // 5 possible line positions
export type Card = [PentagonLine, PentagonLine, PentagonLine]; // [light, medium, dark]
export type Set = [Card, Card, Card, Card, Card];

export enum SymmetryType {
  AllSame,
  ThreeTwo,
  OneTwoTwo,
  Star
}

export interface SymmetryGroup {
  cards: Set;
  symmetryTypes: [SymmetryType, SymmetryType, SymmetryType]; // For each pentagon level
}