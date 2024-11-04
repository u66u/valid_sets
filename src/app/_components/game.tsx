'use client'
import { useState, useEffect } from 'react';
import { CsetGame } from '~/app/logic/game';
import { Card, SymmetryGroup } from '~/app/logic/types';
import { CardVisualizer } from '~/app/logic/visual';
import Modal from './modal';
import Toast from './toast';
import { SymmetryChecker } from '../logic/symmetry';

export default function GameBoard() {
    const [game, setGame] = useState<CsetGame | null>(null);
    const [hand, setHand] = useState<Card[]>([]);

    const [showDeck, setShowDeck] = useState(false);
    const [showSets, setShowSets] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [isReplacingCards, setIsReplacingCards] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [flashingCards, setFlashingCards] = useState<number[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        const newGame = new CsetGame();
        setGame(newGame);
        setHand(newGame.getHand());
    }, []);
    if (!game) return <div>Loading...</div>;

    const validSets = game.findAllSets();

    const handleCardClick = (index: number) => {
        if (!isReplacingCards) {
            if (selectedCards.includes(index)) {
                setSelectedCards(prev => prev.filter(i => i !== index));
            } else if (selectedCards.length < 5) {
                const newSelected = [...selectedCards, index];
                setSelectedCards(newSelected);

                if (newSelected.length === 5) {
                    const selectedSet = newSelected.map(i => hand[i]);
                    const isValid = SymmetryChecker.isValidSet(selectedSet);

                    setFlashingCards(newSelected);
                    if (isValid) {
                        setToast({
                            message: 'Found a set! Drawing new cards...',
                            type: 'success'
                        });
                        setScore(prev => prev + 1);

                        setTimeout(() => {
                            game.removeSet(selectedSet);
                            setHand(game.getHand());
                            setFlashingCards([]);
                            checkGameEnd();
                        }, 1000);
                    } else {
                        setToast({
                            message: 'Not a valid set!',
                            type: 'error'
                        });
                        setTimeout(() => {
                            setFlashingCards([]);
                        }, 500);
                    }
                    setSelectedCards([]);
                }
            }
        } else {
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

    const checkGameEnd = () => {
        // Only end the game if there are no valid sets and no cards in deck
        if (game.deck.cardsRemaining() === 0 && !game.hasValidSets()) {
            setIsGameOver(true);
            setToast({
                message: `Game Over! No more valid sets possible.`,
                type: 'success'
            });
            return true;
        }
        return false;
    };

    const handleReplaceConfirm = () => {
        if (selectedCards.length > 0) {
            game.replaceCards(selectedCards);
            setHand(game.getHand());
            setSelectedCards([]);
            setIsReplacingCards(false);
            checkGameEnd();
        }
    };

    const handleRedrawHand = () => {
        if (game.deck.cardsRemaining() === 0) {
            setIsGameOver(true);
            setToast({
                message: `Game Over! Cannot redraw - deck is empty.`,
                type: 'error'
            });
            return;
        }

        game.redrawHand();
        setHand(game.getHand());
        setSelectedCards([]);
        setIsReplacingCards(false);
        checkGameEnd();
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
                            onClick={handleRedrawHand}
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

                <div className="flex gap-2 mb-4">
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
                ${flashingCards.includes(i)
                                    ? (flashingCards.length === 5 &&
                                        SymmetryChecker.isValidSet(flashingCards.map(idx => hand[idx])))
                                        ? 'animate-flash-green'
                                        : 'animate-flash-red'
                                    : ''
                                }
                ${selectedCards.includes(i)
                                    ? 'bg-blue-50 shadow-md scale-105'
                                    : 'bg-white shadow-sm hover:scale-105'
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

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {isGameOver && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg text-center">
                            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                            <p className="text-xl">Final Score: {score}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600 transition-colors"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}

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