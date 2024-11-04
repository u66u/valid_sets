// visual.ts
import { Card, Set } from './types';

export class CardVisualizer {
  public static createSVG(card: Card): string {
    const colors = ['#f00', '#90f', '#00f', '#0d0', '#f09600'];
    const xsep = 1, ysep = 2.5;
    const pentW = 0.2, lineW = 0.2, outlineW = 0.06;
    
    let svg = `<svg viewBox="-${xsep+1.5} -${ysep/2+0.2} ${xsep*2+3} ${ysep*3+0.2}" width="120" height="200">`;

    card.forEach((p, i) => {
      const cx = i*xsep-xsep;
      const cy = i*ysep;
      const x = (j: number) => cx + Math.sin(Math.PI*2/5*j);
      const y = (j: number) => cy - Math.cos(Math.PI*2/5*j);
      const stroke = ['#aaa','#666','#000'][i];
      const fill = '#ddd';

      // Pentagon
      svg += `<path d="${Array.from({length: 5}, (_, j) => 
        `${j?'L':'M'} ${x(j)} ${y(j)}`).join(' ')}Z" 
        stroke="${stroke}" stroke-width="${pentW}" fill="${fill}"/>`;

      // Line from center to point
      svg += `<path d="M ${cx} ${cy} L ${x(p)} ${y(p)}"
        stroke="${colors[p]}" stroke-width="${lineW}"/>`;

      // Points
      for (let j = 0; j < 5; j++) {
        svg += `<circle cx="${x(j)}" cy="${y(j)}" r="0.2"
          fill="${colors[j]}" stroke="${stroke}" stroke-width="${outlineW}"/>`;
      }

      // Center point
      svg += `<circle cx="${cx}" cy="${cy}" r="0.2"
        fill="${colors[p]}" stroke="${stroke}" stroke-width="${outlineW}"/>`;
    });

    svg += '</svg>';
    return svg;
  }

  public static generateHTML(hand: Card[], validSets: Set[]): string {
    let html = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
    
    // Display hand
    hand.forEach((card, i) => {
      html += `<div style="position: relative">
        ${this.createSVG(card)}
        <div style="text-align: center">Card ${i}</div>
      </div>`;
    });

    // Display valid sets
    if (validSets.length > 0) {
      html += '<div style="width: 100%; margin-top: 20px;">';
      validSets.forEach((set, i) => {
        // Find the card indices that make up this set
        const setIndices = set.map(setCard => 
          hand.findIndex(handCard => 
            handCard[0] === setCard[0] && 
            handCard[1] === setCard[1] && 
            handCard[2] === setCard[2]
          )
        );

        html += `<div style="margin-bottom: 20px;">
          <h3>Valid Set ${i + 1} (Cards: ${setIndices.join(', ')})</h3>
          <div style="display: flex; gap: 10px;">
            ${set.map(card => this.createSVG(card)).join('')}
          </div>
        </div>`;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }
}