"use client";
import { useState, useEffect } from "react";
import { CsetGame } from "~/app/logic/game";
import { Card, SymmetryGroup } from "~/app/logic/types";
import { CardVisualizer } from "~/app/logic/visual";
import Modal from "./modal";
import Toast from "./toast";
import { SymmetryChecker } from "../logic/symmetry";

export default function GameBoard() {
  const [game, setGame] = useState<CsetGame | null>(null);
  const [hand, setHand] = useState<Card[]>([]);

  const [showDeck, setShowDeck] = useState(false);
  const [showSets, setShowSets] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isReplacingCards, setIsReplacingCards] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [flashingCards, setFlashingCards] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConfirmingRedraw, setIsConfirmingRedraw] = useState(false);

  useEffect(() => {
    const newGame = new CsetGame();
    setGame(newGame);
    setHand(newGame.getHand());
  }, []);

  useEffect(() => {
    if (game && !game.hasValidSets() && game.deck.cardsRemaining() === 0) {
      setIsGameOver(true);
    }
  }, [game, hand]);

  if (!game) return <div>Loading...</div>;

  const validSets = game.findAllSets();

  const handleCardClick = (index: number) => {
    if (!isReplacingCards) {
      if (selectedCards.includes(index)) {
        setSelectedCards((prev) => prev.filter((i) => i !== index));
      } else if (selectedCards.length < 5) {
        const newSelected = [...selectedCards, index];
        setSelectedCards(newSelected);

        if (newSelected.length === 5) {
          const selectedSet = newSelected.map((i) => hand[i]);
          const isValid = SymmetryChecker.isValidSet(selectedSet);

          setFlashingCards(newSelected);
          if (isValid) {
            setToast({
              message: "Found a set! Drawing new cards...",
              type: "success",
            });
            setScore((prev) => prev + 1);

            setTimeout(() => {
              game.removeSet(selectedSet);
              setHand(game.getHand());
              setFlashingCards([]);
              checkGameEnd();
            }, 1000);
          } else {
            setToast({
              message: "Not a valid set!",
              type: "error",
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
    setSelectedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const checkGameEnd = () => {
    if (game.deck.cardsRemaining() === 0 && !game.hasValidSets()) {
      setIsGameOver(true);
      setToast({
        message: `Game Over! No more valid sets possible.`,
        type: "success",
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
        type: "error",
      });
      return;
    }

    game.redrawHand();
    setHand(game.getHand());
    setSelectedCards([]);
    setIsReplacingCards(false);
    setIsConfirmingRedraw(false);
    checkGameEnd();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              onClick={() => setShowDeck(true)}
              className="rounded-xl bg-blue-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-blue-600 hover:shadow-blue-500/20"
            >
              <span className="flex items-center gap-2">
                Deck ({game.deck.cardsRemaining()})
              </span>
            </button>
            <button
              onClick={() => setShowSets(true)}
              className="rounded-xl bg-emerald-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-500/20"
            >
              Valid Sets ({validSets.length})
            </button>
            <button
              onClick={() => setShowDiscard(true)}
              className="rounded-xl bg-gray-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gray-600 hover:shadow-gray-500/20"
            >
              Discard pile ({game.deck.getDiscardPile().length})
            </button>
          </div>
          <div className="rounded-xl bg-violet-500/30 bg-opacity-80 px-6 py-2 text-3xl font-bold text-white shadow-lg backdrop-blur-sm">
            Score: {score}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {!isConfirmingRedraw ? (
            <button
              onClick={() => setIsConfirmingRedraw(true)}
              className="rounded-xl bg-amber-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-amber-600 hover:shadow-amber-500/20"
            >
              Redraw Hand
            </button>
          ) : (
            <>
              <button
                onClick={handleRedrawHand}
                className="rounded-xl bg-emerald-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-500/20"
              >
                Confirm Redraw
              </button>
              <button
                onClick={() => setIsConfirmingRedraw(false)}
                className="rounded-xl bg-red-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-red-600 hover:shadow-red-500/20"
              >
                Cancel
              </button>
            </>
          )}
          {!isReplacingCards ? (
            <button
              onClick={() => setIsReplacingCards(true)}
              className="rounded-xl bg-purple-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-purple-600 hover:shadow-purple-500/20"
            >
              Replace Cards
            </button>
          ) : (
            <>
              <button
                onClick={handleReplaceConfirm}
                disabled={selectedCards.length === 0}
                className={`rounded-xl px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 ${
                  selectedCards.length > 0
                    ? "bg-emerald-500/90 hover:bg-emerald-600 hover:shadow-emerald-500/20"
                    : "cursor-not-allowed bg-gray-400/50"
                }`}
              >
                Confirm Replace ({selectedCards.length})
              </button>
              <button
                onClick={() => {
                  setIsReplacingCards(false);
                  setSelectedCards([]);
                }}
                className="rounded-xl bg-red-500/90 px-4 py-2 font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-red-600 hover:shadow-red-500/20"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:grid-cols-6">
          {hand.map((card, i) => (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              className={`transform cursor-pointer rounded-xl p-4 transition-all duration-300 ${
                flashingCards.includes(i)
                  ? flashingCards.length === 5 &&
                    SymmetryChecker.isValidSet(
                      flashingCards.map((idx) => hand[idx]),
                    )
                    ? "animate-flash-green"
                    : "animate-flash-red"
                  : ""
              } ${
                selectedCards.includes(i)
                  ? "scale-105 bg-white/95 shadow-xl ring-2 ring-blue-400"
                  : "bg-white/80 shadow-lg hover:scale-105 hover:shadow-xl"
              } backdrop-blur-sm`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: CardVisualizer.createSVG(card),
                }}
                className="mb-3"
              />
              <div className="text-center font-medium text-gray-700">
                Card {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showDeck}
        onClose={() => setShowDeck(false)}
        title="Cards in Deck"
      >
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 md:grid-cols-4">
          {game.deck.getCards().map((card, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: CardVisualizer.createSVG(card),
                }}
                className="mb-3"
              />
              <div className="text-center font-medium text-gray-700">
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
            const cardIndices = hand
              .map((handCard, idx) => ({
                index: idx,
                card: handCard,
              }))
              .filter(({ card }) =>
                symmetryGroup.cards.some(
                  (setCard) =>
                    setCard[0] === card[0] &&
                    setCard[1] === card[1] &&
                    setCard[2] === card[2],
                ),
              )
              .map(({ index }) => index + 1);

            return (
              <div
                key={setIndex}
                className="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm"
              >
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Set {setIndex + 1} (Cards: {cardIndices.join(", ")})
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {symmetryGroup.cards.map((card, cardIndex) => (
                    <div key={cardIndex}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: CardVisualizer.createSVG(card),
                        }}
                        className="mb-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {validSets.length === 0 && (
            <p className="text-center font-medium text-gray-800">
              No valid sets found!
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showDiscard}
        onClose={() => setShowDiscard(false)}
        title="Discard Pile"
      >
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 md:grid-cols-4">
          {game.deck.getDiscardPile().map((card, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/80 p-4 shadow-lg backdrop-blur-sm"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: CardVisualizer.createSVG(card),
                }}
                className="mb-3"
              />
              <div className="text-center font-medium text-gray-700">
                Card {i + 1}
              </div>
            </div>
          ))}
          {game.deck.getDiscardPile().length === 0 && (
            <p className="col-span-full text-center text-gray-700">
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

      <Modal
        isOpen={isGameOver}
        onClose={() => {
          setIsGameOver(false);
        }}
        title="Game Over!"
      >
        <div className="space-y-6 p-6 text-center">
          <div className="mb-4 text-4xl font-bold text-gray-800">
            Final Score: {score}
          </div>
          <p className="text-lg text-gray-600">No more valid sets available!</p>
          <button
            onClick={() => {
              const newGame = new CsetGame();
              setGame(newGame);
              setHand(newGame.getHand());
              setScore(0);
              setIsGameOver(false);
              setSelectedCards([]);
              setIsReplacingCards(false);
              setFlashingCards([]);
            }}
            className="rounded-xl bg-purple-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-purple-600 hover:shadow-purple-500/20"
          >
            Play Again
          </button>
        </div>
      </Modal>
    </div>
  );
}
