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
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <button
                            onClick={() => setShowDeck(true)}
                            className="px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-xl 
                                     hover:bg-blue-600 shadow-lg hover:shadow-blue-500/20 
                                     transition-all duration-300 font-medium"
                        >
                            <span className="flex items-center gap-2">
                                Deck ({game.deck.cardsRemaining()})
                            </span>
                        </button>
                        <button
                            onClick={() => setShowSets(true)}
                            className="px-4 py-2 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl 
                                     hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/20 
                                     transition-all duration-300 font-medium"
                        >
                            Valid Sets ({validSets.length})
                        </button>
                        <button
                            onClick={() => setShowDiscard(true)}
                            className="px-4 py-2 bg-gray-500/90 backdrop-blur-sm text-white rounded-xl 
                                     hover:bg-gray-600 shadow-lg hover:shadow-gray-500/20 
                                     transition-all duration-300 font-medium"
                        >
                            Discard pile ({game.deck.getDiscardPile().length})
                        </button>
                    </div>
                    <div className="text-3xl font-bold text-white bg-opacity-80 backdrop-blur-sm 
                                  px-6 py-2 rounded-xl bg-violet-500/30 shadow-lg">
                        Score: {score}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={handleRedrawHand}
                        className="px-4 py-2 bg-amber-500/90 backdrop-blur-sm text-white rounded-xl 
                                 hover:bg-amber-600 shadow-lg hover:shadow-amber-500/20 
                                 transition-all duration-300 font-medium"
                    >
                        Redraw Hand
                    </button>
                    {!isReplacingCards ? (
                        <button
                            onClick={() => setIsReplacingCards(true)}
                            className="px-4 py-2 bg-purple-500/90 backdrop-blur-sm text-white rounded-xl 
                                     hover:bg-purple-600 shadow-lg hover:shadow-purple-500/20 
                                     transition-all duration-300 font-medium"
                        >
                            Replace Cards
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleReplaceConfirm}
                                disabled={selectedCards.length === 0}
                                className={`px-4 py-2 rounded-xl text-white font-medium shadow-lg 
                                    transition-all duration-300 ${selectedCards.length > 0
                                    ? 'bg-emerald-500/90 hover:bg-emerald-600 hover:shadow-emerald-500/20'
                                    : 'bg-gray-400/50 cursor-not-allowed'
                                    }`}
                            >
                                Confirm Replace ({selectedCards.length})
                            </button>
                            <button
                                onClick={() => {
                                    setIsReplacingCards(false);
                                    setSelectedCards([]);
                                }}
                                className="px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white rounded-xl 
                                         hover:bg-red-600 shadow-lg hover:shadow-red-500/20 
                                         transition-all duration-300 font-medium"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                    {hand.map((card, i) => (
                        <div
                            key={i}
                            onClick={() => handleCardClick(i)}
                            className={`cursor-pointer p-4 rounded-xl transition-all transform duration-300
                                ${flashingCards.includes(i)
                                    ? (flashingCards.length === 5 &&
                                        SymmetryChecker.isValidSet(flashingCards.map(idx => hand[idx])))
                                        ? 'animate-flash-green'
                                        : 'animate-flash-red'
                                    : ''
                                }
                                ${selectedCards.includes(i)
                                    ? 'bg-white/95 shadow-xl scale-105 ring-2 ring-blue-400'
                                    : 'bg-white/80 shadow-lg hover:shadow-xl hover:scale-105'
                                }
                                backdrop-blur-sm`}
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: CardVisualizer.createSVG(card) }}
                                className="mb-3"
                            />
                            <div className="text-center text-gray-700 font-medium">
                                Card {i + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Keep the existing Modal and Toast components */}
                {/* Reference lines 228-315 */}
            </div>

            <Modal
                isOpen={showDeck}
                onClose={() => setShowDeck(false)}
                title="Cards in Deck"
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 p-4">
                    {game.deck.getCards().map((card, i) => (
                        <div
                            key={i}
                            className="bg-white/80 p-4 rounded-xl shadow-lg backdrop-blur-sm"
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: CardVisualizer.createSVG(card) }}
                                className="mb-3"
                            />
                            <div className="text-center text-gray-700 font-medium">
                                Card {i + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={showSets}
                onClose={() => setShowSets(false)}
                title="Valid Sets"
            >
                <div className="space-y-6 p-4">
                    {validSets.map((symmetryGroup, setIndex) => {
                        const cardIndices = hand.map((handCard, idx) => ({
                            index: idx,
                            card: handCard
                        })).filter(({card}) => 
                            symmetryGroup.cards.some(setCard => 
                                setCard[0] === card[0] && 
                                setCard[1] === card[1] && 
                                setCard[2] === card[2]
                            )
                        ).map(({index}) => index + 1);

                        return (
                            <div key={setIndex} className="bg-white/80 p-4 rounded-xl shadow-lg backdrop-blur-sm">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                    Set {setIndex + 1} (Cards: {cardIndices.join(', ')})
                                </h3>
                                <div className="grid grid-cols-5 gap-4">
                                    {symmetryGroup.cards.map((card, cardIndex) => (
                                        <div key={cardIndex}>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: CardVisualizer.createSVG(card) }}
                                                className="mb-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {validSets.length === 0 && (
                        <p className="text-center text-gray-800 font-medium">No valid sets found!</p>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showDiscard}
                onClose={() => setShowDiscard(false)}
                title="Discard Pile"
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 p-4">
                    {game.deck.getDiscardPile().map((card, i) => (
                        <div
                            key={i}
                            className="bg-white/80 p-4 rounded-xl shadow-lg backdrop-blur-sm"
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: CardVisualizer.createSVG(card) }}
                                className="mb-3"
                            />
                            <div className="text-center text-gray-700 font-medium">
                                Card {i + 1}
                            </div>
                        </div>
                    ))}
                    {game.deck.getDiscardPile().length === 0 && (
                        <p className="text-center text-gray-700 col-span-full">
                            No cards in discard pile
                        </p>
                    )}
                </div>
            </Modal>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}