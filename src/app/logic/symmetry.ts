import { Card, Set, SymmetryGroup } from "./types";

export class SymmetryChecker {
  private static sumMod5(numbers: number[]): number {
    return numbers.reduce((sum, n) => (sum + n) % 5, 0);
  }

  public static isValidSet(cards: Card[]): boolean {
    if (cards.length !== 5) return false;

    for (let level = 0; level < 3; level++) {
      const sum = this.sumMod5(cards.map((card) => card[level]));
      if (sum !== 0) return false;
    }

    return true;
  }

  public static findSets(hand: Card[]): SymmetryGroup[] {
    const sets: SymmetryGroup[] = [];
    const n = hand.length;

    for (let i = 0; i < n - 4; i++) {
      for (let j = i + 1; j < n - 3; j++) {
        for (let k = j + 1; k < n - 2; k++) {
          for (let l = k + 1; l < n - 1; l++) {
            for (let m = l + 1; m < n; m++) {
              const potentialSet = [
                hand[i],
                hand[j],
                hand[k],
                hand[l],
                hand[m],
              ] as Set;

              if (this.isValidSet(potentialSet)) {
                sets.push({
                  cards: potentialSet,
                  symmetryTypes: [0, 0, 0],
                });
              }
            }
          }
        }
      }
    }

    return sets;
  }
}
