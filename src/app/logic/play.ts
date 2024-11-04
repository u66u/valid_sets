// play.ts
import { CsetGame } from "./game";
import { CardVisualizer } from "./visual";
import * as fs from 'fs';

const game = new CsetGame();
const hand = game.getHand();
const validSets = game.findAllSets();

console.log("Hand:", hand);
console.log("Valid sets found:", validSets.length);
validSets.forEach((set, i) => {
  console.log(`Set ${i + 1}:`, set.cards);
});

// Generate visualization HTML
const html = CardVisualizer.generateHTML(hand, validSets.map(set => set.cards));
fs.writeFileSync('visualization.html', html);
console.log("Visualization saved to visualization.html");