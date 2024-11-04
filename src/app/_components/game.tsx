'use client'
import { useState } from 'react';
import { CsetGame } from '~/app/logic/game';
import { Card, SymmetryGroup } from '~/app/logic/types';
import { CardVisualizer } from '~/app/logic/visual';
import Modal from './modal';

export default function GameBoard() {
    const [game] = useState(() => new CsetGame());
    const [hand, setHand] = useState<Card[]>(game.getHand());
    const [showDeck, setShowDeck] = useState(false);
    const [showSets, setShowSets] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [isReplacingCards, setIsReplacingCards] = useState(false);

    const validSets = game.findAllSets();

    const handleCardClick = (index: number) => {
        if (!isReplacingCards) {
            // Set finding mode
            if (selectedCards.includes(index)) {
                setSelectedCards(prev => prev.filter(i => i !== index));
            } else if (selectedCards.length < 5) {
                const newSelected = [...selectedCards, index];
                setSelectedCards(newSelected);

                if (newSelected.length === 5) {
                    // Check if selected cards form a valid set
                    const selectedSet = newSelected.map(i => hand[i]);
                    const isValid = validSets.some(set =>
                        set.cards.every(card =>
                            selectedSet.some(selected =>
                                selected[0] === card[0] &&
                                selected[1] === card[1] &&
                                selected[2] === card[2]
                            )
                        )
                    );

                    if (isValid) {
                        setScore(prev => prev + 1);
                        game.removeSet(selectedSet);
                        setHand(game.getHand());
                    }
                    setSelectedCards([]);
                }
            }
        } else {
            // Card replacement mode
            toggleCardSelection(index);
        }
    };

    const toggleCardSelection = (index: number) => {
        setSelectedCards(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleReplaceConfirm = () => {
        if (selectedCards.length > 0) {
            game.replaceCards(selectedCards);
            setHand(game.getHand());
            setSelectedCards([]);
            setIsReplacingCards(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeck(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                     shadow-sm transition-colors font-medium"
                        >
                            Deck ({game.deck.cardsRemaining()})
                        </button>
                        <button
                            onClick={() => setShowSets(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                                     shadow-sm transition-colors font-medium"
                        >
                            Valid Sets ({validSets.length})
                        </button>
                        <button
                            onClick={() => setShowDiscard(true)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
                                     shadow-sm transition-colors font-medium"
                        >
                            Discard ({game.deck.getDiscardPile().length})
                        </button>
                        <button
                            onClick={() => {
                                game.redrawHand();
                                setHand(game.getHand());
                                setSelectedCards([]);
                            }}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
                                     shadow-sm transition-colors font-medium"
                        >
                            Redraw Hand
                        </button>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                        Score: {score}
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    {!isReplacingCards ? (
                        <button
                            onClick={() => setIsReplacingCards(true)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
                                     shadow-sm transition-colors font-medium"
                        >
                            Replace Cards
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleReplaceConfirm}
                                disabled={selectedCards.length === 0}
                                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm 
                                          transition-colors ${selectedCards.length > 0
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Confirm Replace ({selectedCards.length})
                            </button>
                            <button
                                onClick={() => {
                                    setIsReplacingCards(false);
                                    setSelectedCards([]);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                                         shadow-sm transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-6 gap-6">
                    {hand.map((card, i) => (
                        <div
                            key={i}
                            onClick={() => handleCardClick(i)}
                            className={`cursor-pointer p-3 rounded-lg transition-all transform 
                                      hover:scale-105 ${selectedCards.includes(i)
                                    ? 'bg-blue-50 shadow-md'
                                    : 'bg-white shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: CardVisualizer.createSVG(card, true) }}
                                className="mb-2"
                            />
                            <div className="text-center text-gray-600 font-medium">
                                Card {i}
                            </div>
                        </div>
                    ))}
                </div>

                <Modal
                    isOpen={showDeck}
                    onClose={() => setShowDeck(false)}
                    title={`Deck (${game.deck.cardsRemaining()} cards)`}
                >
                    <div className="grid grid-cols-5 gap-4">
                        {game.deck.getCards().map((card, i) => (
                            <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                                <div dangerouslySetInnerHTML={{
                                    __html: CardVisualizer.createSVG(card, true)
                                }} />
                            </div>
                        ))}
                    </div>
                </Modal>

                <Modal
                    isOpen={showSets}
                    onClose={() => setShowSets(false)}
                    title={`Valid Sets (${validSets.length} found)`}
                >
                    <div className="space-y-6">
                        {validSets.map((set, i) => {
                            const setIndices = set.cards.map(setCard =>
                                hand.findIndex(handCard =>
                                    handCard[0] === setCard[0] &&
                                    handCard[1] === setCard[1] &&
                                    handCard[2] === setCard[2]
                                )
                            );

                            return (
                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                                        Set {i + 1} (Cards: {setIndices.join(', ')})
                                    </h3>
                                    <div className="flex gap-4">
                                        {set.cards.map((card, j) => (
                                            <div key={j} dangerouslySetInnerHTML={{
                                                __html: CardVisualizer.createSVG(card, true)
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Modal>

                <Modal
                    isOpen={showDiscard}
                    onClose={() => setShowDiscard(false)}
                    title={`Discard Pile (${game.deck.getDiscardPile().length} cards)`}
                >
                    <div className="grid grid-cols-5 gap-4">
                        {game.deck.getDiscardPile().map((card, i) => (
                            <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                                <div dangerouslySetInnerHTML={{
                                    __html: CardVisualizer.createSVG(card, true)
                                }} />
                            </div>
                        ))}
                    </div>
                </Modal>
            </div>
        </div>
    );
}