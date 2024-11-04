import type { Card, SymmetryGroup } from "./types";
import { Deck } from "./deck";
import { SymmetryChecker } from "./symmetry";

export class CsetGame {
  public deck: Deck;
  private hand: Card[] = [];

  constructor() {
    this.deck = new Deck();
    this.deck.shuffle();
    this.drawInitialHand();
  }

  private drawInitialHand(): void {
    this.hand = this.deck.draw(12);
  }

  public findAllSets(): SymmetryGroup[] {
    return SymmetryChecker.findSets(this.hand);
  }

  public redrawHand(): void {
    this.deck.discard(this.hand);
    this.hand = [];

    this.hand = this.deck.draw(12);
  }

  public hasValidSets(): boolean {
    return this.findAllSets().length > 0;
  }

  public getHand(): Card[] {
    return [...this.hand];
  }

  public removeSet(cards: Card[]): void {
    cards.forEach((card) => {
      const index = this.hand.findIndex(
        (c) => c[0] === card[0] && c[1] === card[1] && c[2] === card[2],
      );
      if (index !== -1) {
        this.hand.splice(index, 1);
      }
    });

    const newCards = this.deck.draw(cards.length);
    this.hand.push(...newCards);
  }

  public replaceCards(cardIndices: number[]): void {
    const cardsToDiscard = cardIndices.map((i) => this.hand[i]);

    cardIndices
      .sort((a, b) => b - a)
      .forEach((index) => {
        this.hand.splice(index, 1);
      });

    this.deck.discard(cardsToDiscard as Card[]);

    const newCards = this.deck.draw(cardIndices.length);
    this.hand.push(...newCards);
  }
}
