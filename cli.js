/**
 * basic command line interface to test job poker round
 */

// Core
const Game = require('./job');

// Prompts for cli
const { NumberPrompt, MultiSelect } = require('enquirer');

// Init game
const game = new Game();
game.addCredits(200);
game.setStake(5);

console.log('Credit:', game.credit);

game.take();

console.log('Credit:', game.credit);

game.deal();

const prompt = new MultiSelect({
  name: 'value',
  message: game.evaluate().rank,
  limit: game.handSize,
  choices: game.hand.map((card) => {
    return { name: card, value: card };
  }),
});

prompt
  .run()
  .then((answer) => {
    game.draw(answer);
    console.log(`Final hand: ${game.hand.join(', ')} ${game.evaluate().rank}`);
    game.pay();
    console.log('Credit:', game.credit);
  })
  .catch(console.error);
