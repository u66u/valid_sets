import type { Card, PentagonLine } from "./types";

export class Deck {
  private cards: Card[] = [];
  private discardPile: Card[] = [];

  constructor() {
    this.generateDeck();
  }

  private generateDeck(): void {
    for (let light = 0; light < 5; light++) {
      for (let medium = 0; medium < 5; medium++) {
        for (let dark = 0; dark < 5; dark++) {
          this.cards.push([
            light as PentagonLine,
            medium as PentagonLine,
            dark as PentagonLine,
          ]);
        }
      }
    }
  }

  public shuffle(): void {
    const length = this.cards.length;
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.cards[i]!;
      this.cards[i] = this.cards[j]!;
      this.cards[j] = temp;
    }
  }

  public draw(count: number): Card[] {
    return this.cards.splice(0, count);
  }

  public discard(cards: Card[]): void {
    this.discardPile.push(...cards);
  }

  public cardsRemaining(): number {
    return this.cards.length;
  }

  public totalCardsAvailable(): number {
    return this.cards.length + this.discardPile.length;
  }

  public getCards(): Card[] {
    return [...this.cards];
  }

  public getDiscardPile(): Card[] {
    return [...this.discardPile];
  }
}
