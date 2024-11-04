'use client'
import { useState } from 'react';
import { CsetGame } from '~/app/logic/game';
import { Card, Set } from '~/app/logic/types';
import { CardVisualizer } from '~/app/logic/visual';
import Modal from './modal';

export default function GameBoard() {
    const [game] = useState(() => new CsetGame());
    const [hand, setHand] = useState<Card[]>(game.getHand());
    const [showDeck, setShowDeck] = useState(false);
    const [showSets, setShowSets] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    const validSets = game.findAllSets();

    const handleRedraw = () => {
        game.redrawHand();
        setHand(game.getHand());
        setSelectedCards([]);
    };

    const handleReplaceSelected = () => {
        if (selectedCards.length > 0) {
            game.replaceCards(selectedCards);
            setHand(game.getHand());
            setSelectedCards([]);
        }
    };

    const toggleCardSelection = (index: number) => {
        setSelectedCards(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setShowDeck(true)}
                    className="btn btn-primary"
                >
                    Show Deck ({game.deck.cardsRemaining()})
                </button>
                <button
                    onClick={() => setShowSets(true)}
                    className="btn btn-secondary"
                >
                    Show Valid Sets ({validSets.length})
                </button>
                <button
                    onClick={() => setShowDiscard(true)}
                    className="btn btn-secondary"
                >
                    Show Discard Pile
                </button>
                <button
                    onClick={handleRedraw}
                    className="btn btn-warning"
                >
                    Redraw Hand
                </button>
                <button
                    onClick={handleReplaceSelected}
                    disabled={selectedCards.length === 0}
                    className="btn btn-info"
                >
                    Replace Selected ({selectedCards.length})
                </button>
            </div>

            <div className="grid grid-cols-6 gap-4">
                {hand.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => toggleCardSelection(i)}
                        className={`cursor-pointer p-2 rounded ${selectedCards.includes(i) ? 'bg-blue-100' : ''
                            }`}
                    >
                        <div dangerouslySetInnerHTML={{
                            __html: CardVisualizer.createSVG(card)
                        }} />
                        <div className="text-center">Card {i}</div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <Modal
                isOpen={showDeck}
                onClose={() => setShowDeck(false)}
                title="Remaining Deck"
            >
                <div className="grid grid-cols-5 gap-2">
                    {game.deck.getCards().map((card, i) => (
                        <div key={i} dangerouslySetInnerHTML={{
                            __html: CardVisualizer.createSVG(card)
                        }} />
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={showSets}
                onClose={() => setShowSets(false)}
                title="Valid Sets"
            >
                <div className="space-y-4">
                    {validSets.map((set, i) => (
                        <div key={i}>
                            <h3>Set {i + 1} (Cards: {
                                set.cards.map(card =>
                                    hand.findIndex(c =>
                                        c[0] === card[0] &&
                                        c[1] === card[1] &&
                                        c[2] === card[2]
                                    )
                                ).join(', ')
                            })</h3>
                            <div className="flex gap-2">
                                {set.cards.map((card, j) => (
                                    <div key={j} dangerouslySetInnerHTML={{
                                        __html: CardVisualizer.createSVG(card)
                                    }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={showDiscard}
                onClose={() => setShowDiscard(false)}
                title="Discard Pile"
            >
                <div className="grid grid-cols-5 gap-2">
                    {game.deck.getDiscardPile().map((card, i) => (
                        <div key={i} dangerouslySetInnerHTML={{
                            __html: CardVisualizer.createSVG(card)
                        }} />
                    ))}
                </div>
            </Modal>
        </div>
    );
}