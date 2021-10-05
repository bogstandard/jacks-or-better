const PokerHand = require('poker-hand-evaluator');

/**
 * Jacks or Better poker handler
 *
 * order of play:
 *                game = new Game()
 *                game.addCredits(200)
 *                game.setStake(5)
 *                game.take()
 *                game.deal()
 *                game.draw(array_of_held_cards)
 *                game.pay()
 */

// set shuffle on the array prototype
Object.defineProperty(Array.prototype, 'shuffle', {
  value: function () {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  },
});

module.exports = class Game {
  constructor() {
    // Pay Table
    this.paytable = {
      ROYAL_FLUSH: 250,
      STRAIGHT_FLUSH: 50,
      FOUR_OF_A_KIND: 25,
      FULL_HOUSE: 9,
      FLUSH: 6,
      STRAIGHT: 4,
      THREE_OF_A_KIND: 3,
      TWO_PAIRS: 2,
      JACKS_OR_BETTER: 1,
      NO_WIN: 0,
    };

    // Credit/Stake
    this.credit = 0;
    this.maxStake = 5;
    this.minStake = 1;
    this.stake = this.minStake;

    // Hand
    this.handSize = 5;
    this.hand = Array(this.handSize).fill('__'); // default to house cards

    // Deck
    // adapted from codeKonami/poker-hand/blob/master/test/complete.js
    this.cards = {
      cardOrder: [
        'A',
        'K',
        'Q',
        'J',
        'T',
        '9',
        '8',
        '7',
        '6',
        '5',
        '4',
        '3',
        '2',
      ],
      suits: ['S', 'H', 'D', 'C'],
    };

    this.totalCards = this.cards.cardOrder.length * this.cards.suits.length;

    this.deck = [...Array(this.totalCards)].map((_, i) => {
      return (
        this.cards.cardOrder[i % this.cards.cardOrder.length] +
        this.cards.suits[i % this.cards.suits.length]
      );
    });
  }

  addCredits(credits) {
    this.credit += Math.floor(credits);
  }

  setStake(stakes) {
    this.stake = Math.min(
      Math.max(parseInt(stakes), this.minStake),
      this.maxStake
    );
  }

  take() {
    this.credit -= this.stake;
  }

  pay() {
    const rank = this.evaluate().rank;
    this.credit += this.paytable[rank] * this.stake;
  }

  deal() {
    this.deck.shuffle(); // shuffle
    this.hand = this.deck.slice(0, this.handSize); // draw the hand from top
  }

  draw(holds) {
    if (holds.length === 0) return;
    let i = this.handSize;
    this.hand = this.hand.map((card) => {
      return holds.includes(card) ? card : this.deck[i++]; // is held card? replace
    });
  }

  evaluate() {
    const fhand = this.hand.join(' ');
    const result = new PokerHand(fhand);
    const description = result.describe();

    // check if the pair is jacks or better! ..
    // ..
    // is it ONE_PAIR or less (HIGH_CARD)
    if (description.score > 3325) {
      const cs = this.hand
        .map((c) => {
          return c.charAt(0); // get suitless
        })
        .filter((c) => {
          return ['A', 'J', 'Q', 'K'].includes(c); // jacks or better please..
        });

      // if no duplicates then its not jacks or better
      if (new Set(cs).size === cs.length) {
        description.score = 0;
        description.rank = 'NO_WIN';
      } else if (description.rank === 'ONE_PAIR') {
        // dupes detected, is it one pair? it must be job
        description.rank = 'JACKS_OR_BETTER';
      }
    }

    return description;
  }
};
