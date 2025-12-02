/**
 * Cookie Clicker version v2048 data
 * Ported from Python v2048.py
 */

import { Upgrade, Effect } from '../../js/game.js';

const million = 10**6;
const billion = 10**9;
const trillion = 10**12;
const quadrillion = 10**15;
const quintillion = 10**18;
const sextillion = 10**21;
const septillion = 10**24;

export const buildingNames = [
  'Cursor',
  'Grandma',
  'Farm',
  'Mine',
  'Factory',
  'Bank',
  'Temple',
  'Wizard tower',
  'Shipment',
  'Alchemy lab',
  'Portal',
  'Time machine',
  'Antimatter condenser',
  'Prism',
  'Chancemaker',
  'Fractal engine',
  'Javascript console',
  'Idleverse',
  'Cortex baker',
];

export const basePrices = {
  'Cursor': 15,
  'Grandma': 100,
  'Farm': 1100,
  'Mine': 12000,
  'Factory': 130000,
  'Bank': 1.4 * million,
  'Temple': 20 * million,
  'Wizard tower': 330 * million,
  'Shipment': 5.1 * billion,
  'Alchemy lab': 75 * billion,
  'Portal': 1 * trillion,
  'Time machine': 14 * trillion,
  'Antimatter condenser': 170 * trillion,
  'Prism': 2.1 * quadrillion,
  'Chancemaker': 26 * quadrillion,
  'Fractal engine': 310 * quadrillion,
  'Javascript console': 71 * quintillion,
  'Idleverse': 12 * sextillion,
  'Cortex baker': 1.9 * septillion,
};

export const baseRates = {
  'Cursor': 0.1,
  'Grandma': 1,
  'Farm': 8,
  'Mine': 47,
  'Factory': 260,
  'Bank': 1400,
  'Temple': 7800,
  'Wizard tower': 44000,
  'Shipment': 260000,
  'Alchemy lab': 1.6 * million,
  'Portal': 10 * million,
  'Time machine': 65 * million,
  'Antimatter condenser': 430 * million,
  'Prism': 2.9 * billion,
  'Chancemaker': 22 * billion,
  'Fractal engine': 150 * billion,
  'Javascript console': 1.1 * trillion,
  'Idleverse': 8.3 * trillion,
  'Cortex baker': 64 * trillion,
};

// Effects
function multiplier(x) {
  const func = (r, game) => r * x;
  return new Effect(2, func);
}

function grandmaBoost(n) {
  const func = (r, game) => r * (1 + 0.01 * Math.floor(game.numBuildings['Grandma'] / n));
  return new Effect(2, func);
}

function fingersBoost(x) {
  const func = (r, game) => {
    let sum = 0;
    for (const name of game.buildingNames) {
      if (name !== 'Cursor') {
        sum += game.numBuildings[name];
      }
    }
    return r + x * sum;
  };
  return new Effect(1, func);
}

function percentBoost(p) {
  const func = (r, game) => r * (1 + p / 100.0);
  return new Effect(0, func);
}

const double = multiplier(2.0);
const mouseBoost = new Effect(1, (r, game) => r + 0.01 * game.buildingOnlyRate());

// The set of all upgrades
export const menu = new Set();

// Cursor & mouse upgrades
menu.add(new Upgrade('Reinforced index finger', { 'Cursor': 1 }, 100, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Carpel tunnel prevention cream', { 'Cursor': 1 }, 500, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Ambidextrous', { 'Cursor': 10 }, 10000, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Thousand fingers', { 'Cursor': 25 }, 100000, { 'Cursor': fingersBoost(0.1), 'mouse': fingersBoost(0.1) }));
menu.add(new Upgrade('Million fingers', { 'Cursor': 50 }, 10 * million, { 'Cursor': fingersBoost(0.4), 'mouse': fingersBoost(0.4) }));
menu.add(new Upgrade('Billion fingers', { 'Cursor': 100 }, 100 * million, { 'Cursor': fingersBoost(4.5), 'mouse': fingersBoost(4.5) }));
menu.add(new Upgrade('Trillion fingers', { 'Cursor': 150 }, 1 * billion, { 'Cursor': fingersBoost(45), 'mouse': fingersBoost(45) }));
menu.add(new Upgrade('Quadrillion fingers', { 'Cursor': 200 }, 10 * billion, { 'Cursor': fingersBoost(950), 'mouse': fingersBoost(950) }));
menu.add(new Upgrade('Quintillion fingers', { 'Cursor': 250 }, 10 * trillion, { 'Cursor': fingersBoost(19000), 'mouse': fingersBoost(19000) }));
menu.add(new Upgrade('Sextillion fingers', { 'Cursor': 300 }, 10 * quadrillion, { 'Cursor': fingersBoost(380000), 'mouse': fingersBoost(380000) }));
menu.add(new Upgrade('Septillion fingers', { 'Cursor': 350 }, 10 * quintillion, { 'Cursor': fingersBoost(7.6 * million), 'mouse': fingersBoost(7.6 * million) }));
menu.add(new Upgrade('Octillion fingers', { 'Cursor': 400 }, 10 * sextillion, { 'Cursor': fingersBoost(152 * million), 'mouse': fingersBoost(152 * million) }));
menu.add(new Upgrade('Nonillion fingers', { 'Cursor': 450 }, 10 * septillion, { 'Cursor': fingersBoost(3.04 * billion), 'mouse': fingersBoost(3.04 * billion) }));

// Mouse only upgrades
menu.add(new Upgrade('Plastic mouse', {}, 50000, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Iron mouse', {}, 5 * million, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Titanium mouse', {}, 500 * million, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Adamantium mouse', {}, 50 * billion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Unobtanium mouse', {}, 5 * trillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Eludium mouse', {}, 500 * trillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Wishalloy mouse', {}, 50 * quadrillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Fantasteel mouse', {}, 5 * quintillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Nevercrack mouse', {}, 500 * quintillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Armythril mouse', {}, 50 * sextillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Technobsidian mouse', {}, 5 * septillion, { 'mouse': mouseBoost }));
menu.add(new Upgrade('Plasmarble mouse', {}, 500 * septillion, { 'mouse': mouseBoost }));

// Grandma upgrades
menu.add(new Upgrade('Forwards from grandma', { 'Grandma': 1 }, 1000, { 'Grandma': double }));
menu.add(new Upgrade('Steel-plated rolling pins', { 'Grandma': 5 }, 5000, { 'Grandma': double }));
menu.add(new Upgrade('Lubricated dentures', { 'Grandma': 25 }, 50000, { 'Grandma': double }));
menu.add(new Upgrade('Prune juice', { 'Grandma': 50 }, 5 * million, { 'Grandma': double }));
menu.add(new Upgrade('Double-thick glasses', { 'Grandma': 100 }, 500 * million, { 'Grandma': double }));
menu.add(new Upgrade('Aging agents', { 'Grandma': 150 }, 50 * billion, { 'Grandma': double }));
menu.add(new Upgrade('Xtreme walkers', { 'Grandma': 200 }, 50 * trillion, { 'Grandma': double }));
menu.add(new Upgrade('The Unbridling', { 'Grandma': 250 }, 50 * quadrillion, { 'Grandma': double }));
menu.add(new Upgrade('Reverse dementia', { 'Grandma': 300 }, 50 * quintillion, { 'Grandma': double }));
menu.add(new Upgrade('Timeproof hair dyes', { 'Grandma': 350 }, 50 * sextillion, { 'Grandma': double }));
menu.add(new Upgrade('Good manners', { 'Grandma': 400 }, 500 * septillion, { 'Grandma': double }));

// Grandma type upgrades
menu.add(new Upgrade('Farmer grandmas', { 'Grandma': 1, 'Farm': 15 }, 55000, { 'Grandma': double, 'Farm': grandmaBoost(1) }));
menu.add(new Upgrade('Miner grandmas', { 'Grandma': 1, 'Mine': 15 }, 600000, { 'Grandma': double, 'Mine': grandmaBoost(2) }));
menu.add(new Upgrade('Worker grandmas', { 'Grandma': 1, 'Factory': 15 }, 6.5 * million, { 'Grandma': double, 'Factory': grandmaBoost(3) }));
menu.add(new Upgrade('Banker grandmas', { 'Grandma': 1, 'Bank': 15 }, 70 * million, { 'Grandma': double, 'Bank': grandmaBoost(4) }));
menu.add(new Upgrade('Priestess grandmas', { 'Grandma': 1, 'Temple': 15 }, 1 * billion, { 'Grandma': double, 'Temple': grandmaBoost(5) }));
menu.add(new Upgrade('Witch grandmas', { 'Grandma': 1, 'Wizard tower': 15 }, 16.5 * billion, { 'Grandma': double, 'Wizard tower': grandmaBoost(6) }));
menu.add(new Upgrade('Cosmic grandmas', { 'Grandma': 1, 'Shipment': 15 }, 255 * billion, { 'Grandma': double, 'Shipment': grandmaBoost(7) }));
menu.add(new Upgrade('Transmuted grandmas', { 'Grandma': 1, 'Alchemy lab': 15 }, 255 * billion, { 'Grandma': double, 'Alchemy lab': grandmaBoost(8) }));
menu.add(new Upgrade('Altered grandmas', { 'Grandma': 1, 'Portal': 15 }, 255 * billion, { 'Grandma': double, 'Portal': grandmaBoost(9) }));
menu.add(new Upgrade('Grandmas\' grandmas', { 'Grandma': 1, 'Time machine': 15 }, 700 * trillion, { 'Grandma': double, 'Time machine': grandmaBoost(10) }));
menu.add(new Upgrade('Antigrandmas', { 'Grandma': 1, 'Antimatter condenser': 15 }, 8.5 * quadrillion, { 'Grandma': double, 'Antimatter condenser': grandmaBoost(11) }));
menu.add(new Upgrade('Rainbow grandmas', { 'Grandma': 1, 'Prism': 15 }, 105 * quadrillion, { 'Grandma': double, 'Prism': grandmaBoost(12) }));
menu.add(new Upgrade('Lucky grandmas', { 'Grandma': 1, 'Chancemaker': 15 }, 1.3 * quintillion, { 'Grandma': double, 'Chancemaker': grandmaBoost(13) }));
menu.add(new Upgrade('Metagrandmas', { 'Grandma': 1, 'Fractal engine': 15 }, 15.5 * quintillion, { 'Grandma': double, 'Fractal engine': grandmaBoost(14) }));
menu.add(new Upgrade('Binary grandmas', { 'Grandma': 1, 'Javascript console': 15 }, 3.55 * sextillion, { 'Grandma': double, 'Javascript console': grandmaBoost(15) }));
menu.add(new Upgrade('Alternate grandmas', { 'Grandma': 1, 'Idleverse': 15 }, 600 * sextillion, { 'Grandma': double, 'Idleverse': grandmaBoost(16) }));
menu.add(new Upgrade('Brainy grandmas', { 'Grandma': 1, 'Cortex baker': 15 }, 95 * septillion, { 'Grandma': double, 'Cortex baker': grandmaBoost(17) }));

// Farm upgrades
menu.add(new Upgrade('Cheap hoes', { 'Farm': 1 }, 11000, { 'Farm': double }));
menu.add(new Upgrade('Fertilizer', { 'Farm': 5 }, 55000, { 'Farm': double }));
menu.add(new Upgrade('Cookie trees', { 'Farm': 25 }, 550000, { 'Farm': double }));
menu.add(new Upgrade('Genetically-modified cookies', { 'Farm': 50 }, 55 * million, { 'Farm': double }));
menu.add(new Upgrade('Gingerbread scarecrows', { 'Farm': 100 }, 5.5 * billion, { 'Farm': double }));
menu.add(new Upgrade('Pulsar sprinklers', { 'Farm': 150 }, 550 * billion, { 'Farm': double }));
menu.add(new Upgrade('Fudge fungus', { 'Farm': 200 }, 550 * trillion, { 'Farm': double }));
menu.add(new Upgrade('Wheat triffids', { 'Farm': 250 }, 550 * quadrillion, { 'Farm': double }));
menu.add(new Upgrade('Humane pesticides', { 'Farm': 300 }, 550 * quintillion, { 'Farm': double }));
menu.add(new Upgrade('Barnstars', { 'Farm': 350 }, 550 * sextillion, { 'Farm': double }));

// Mine upgrades
menu.add(new Upgrade('Sugar gas', { 'Mine': 1 }, 120000, { 'Mine': double }));
menu.add(new Upgrade('Mega drill', { 'Mine': 5 }, 600000, { 'Mine': double }));
menu.add(new Upgrade('Ultradrill', { 'Mine': 25 }, 6 * million, { 'Mine': double }));
menu.add(new Upgrade('Ultimadrill', { 'Mine': 50 }, 600 * million, { 'Mine': double }));
menu.add(new Upgrade('H-bomb mining', { 'Mine': 100 }, 60 * billion, { 'Mine': double }));
menu.add(new Upgrade('Coreforge', { 'Mine': 150 }, 6 * trillion, { 'Mine': double }));
menu.add(new Upgrade('Planetsplitters', { 'Mine': 200 }, 6 * quadrillion, { 'Mine': double }));
menu.add(new Upgrade('Canola oil wells', { 'Mine': 250 }, 6 * quintillion, { 'Mine': double }));
menu.add(new Upgrade('Mole people', { 'Mine': 300 }, 6 * sextillion, { 'Mine': double }));
menu.add(new Upgrade('Mine canaries', { 'Mine': 350 }, 6 * septillion, { 'Mine': double }));

// Factory upgrades
menu.add(new Upgrade('Sturdier conveyor belts', { 'Factory': 1 }, 1.3 * million, { 'Factory': double }));
menu.add(new Upgrade('Child labor', { 'Factory': 5 }, 6.5 * million, { 'Factory': double }));
menu.add(new Upgrade('Sweatshop', { 'Factory': 25 }, 65 * million, { 'Factory': double }));
menu.add(new Upgrade('Radium reactors', { 'Factory': 50 }, 6.5 * billion, { 'Factory': double }));
menu.add(new Upgrade('Recombobulators', { 'Factory': 100 }, 650 * billion, { 'Factory': double }));
menu.add(new Upgrade('Deep-bake process', { 'Factory': 150 }, 65 * trillion, { 'Factory': double }));
menu.add(new Upgrade('Cyborg workforce', { 'Factory': 200 }, 65 * quadrillion, { 'Factory': double }));
menu.add(new Upgrade('78-hour days', { 'Factory': 250 }, 65 * quintillion, { 'Factory': double }));
menu.add(new Upgrade('Machine learning', { 'Factory': 300 }, 65 * sextillion, { 'Factory': double }));
menu.add(new Upgrade('Brownie point system', { 'Factory': 350 }, 65 * septillion, { 'Factory': double }));

// Bank upgrades
menu.add(new Upgrade('Taller tellers', { 'Bank': 1 }, 14 * million, { 'Bank': double }));
menu.add(new Upgrade('Scissor-resistant credit cards', { 'Bank': 5 }, 70 * million, { 'Bank': double }));
menu.add(new Upgrade('Acid-proof vaults', { 'Bank': 25 }, 700 * million, { 'Bank': double }));
menu.add(new Upgrade('Chocolate coins', { 'Bank': 50 }, 70 * billion, { 'Bank': double }));
menu.add(new Upgrade('Exponential interest rates', { 'Bank': 100 }, 7 * trillion, { 'Bank': double }));
menu.add(new Upgrade('Financial zen', { 'Bank': 150 }, 700 * trillion, { 'Bank': double }));
menu.add(new Upgrade('Way of the wallet', { 'Bank': 200 }, 700 * quadrillion, { 'Bank': double }));
menu.add(new Upgrade('The stuff rationale', { 'Bank': 250 }, 700 * quintillion, { 'Bank': double }));
menu.add(new Upgrade('Edible money', { 'Bank': 300 }, 700 * sextillion, { 'Bank': double }));
menu.add(new Upgrade('Grand supercycle', { 'Bank': 350 }, 700 * septillion, { 'Bank': double }));

// Temple upgrades
menu.add(new Upgrade('Golden idols', { 'Temple': 1 }, 200 * million, { 'Temple': double }));
menu.add(new Upgrade('Sacrifices', { 'Temple': 5 }, 1 * billion, { 'Temple': double }));
menu.add(new Upgrade('Delicious blessing', { 'Temple': 25 }, 10 * billion, { 'Temple': double }));
menu.add(new Upgrade('Sun festival', { 'Temple': 50 }, 1 * trillion, { 'Temple': double }));
menu.add(new Upgrade('Enlarged pantheon', { 'Temple': 100 }, 100 * trillion, { 'Temple': double }));
menu.add(new Upgrade('Great Baker in the sky', { 'Temple': 150 }, 10 * quadrillion, { 'Temple': double }));
menu.add(new Upgrade('Creation myth', { 'Temple': 200 }, 10 * quintillion, { 'Temple': double }));
menu.add(new Upgrade('Theocracy', { 'Temple': 250 }, 10 * sextillion, { 'Temple': double }));
menu.add(new Upgrade('Sick rap prayers', { 'Temple': 300 }, 10 * septillion, { 'Temple': double }));

// Wizard tower upgrades
menu.add(new Upgrade('Pointier hats', { 'Wizard tower': 1 }, 3.3 * billion, { 'Wizard tower': double }));
menu.add(new Upgrade('Beardlier beards', { 'Wizard tower': 5 }, 16.5 * billion, { 'Wizard tower': double }));
menu.add(new Upgrade('Ancient grimoires', { 'Wizard tower': 25 }, 165 * billion, { 'Wizard tower': double }));
menu.add(new Upgrade('Kitchen curses', { 'Wizard tower': 50 }, 16.5 * trillion, { 'Wizard tower': double }));
menu.add(new Upgrade('School of sorcery', { 'Wizard tower': 100 }, 1.65 * quadrillion, { 'Wizard tower': double }));
menu.add(new Upgrade('Dark formulas', { 'Wizard tower': 150 }, 165 * quadrillion, { 'Wizard tower': double }));
menu.add(new Upgrade('Cookiemancy', { 'Wizard tower': 200 }, 165 * quintillion, { 'Wizard tower': double }));
menu.add(new Upgrade('Rabbit trick', { 'Wizard tower': 250 }, 165 * sextillion, { 'Wizard tower': double }));
menu.add(new Upgrade('Deluxe tailored wands', { 'Wizard tower': 300 }, 165 * septillion, { 'Wizard tower': double }));

// Shipment upgrades
menu.add(new Upgrade('Vanilla nebulae', { 'Shipment': 1 }, 51 * billion, { 'Shipment': double }));
menu.add(new Upgrade('Wormholes', { 'Shipment': 5 }, 255 * billion, { 'Shipment': double }));
menu.add(new Upgrade('Frequent flyer', { 'Shipment': 25 }, 2.55 * trillion, { 'Shipment': double }));
menu.add(new Upgrade('Warp drive', { 'Shipment': 50 }, 255 * trillion, { 'Shipment': double }));
menu.add(new Upgrade('Chocolate monoliths', { 'Shipment': 100 }, 25.5 * quadrillion, { 'Shipment': double }));
menu.add(new Upgrade('Generation ship', { 'Shipment': 150 }, 2.55 * quintillion, { 'Shipment': double }));
menu.add(new Upgrade('Dyson sphere', { 'Shipment': 200 }, 2.55 * sextillion, { 'Shipment': double }));
menu.add(new Upgrade('The final frontier', { 'Shipment': 250 }, 2.55 * septillion, { 'Shipment': double }));

// Alchemy lab upgrades
menu.add(new Upgrade('Antimony', { 'Alchemy lab': 1 }, 750 * billion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Essence of dough', { 'Alchemy lab': 5 }, 3.75 * trillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('True chocolate', { 'Alchemy lab': 25 }, 37.5 * trillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Ambrosia', { 'Alchemy lab': 50 }, 3.75 * quadrillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Aqua crustulae', { 'Alchemy lab': 100 }, 375 * quadrillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Origin crucible', { 'Alchemy lab': 150 }, 37.5 * quintillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Theory of atomic fluidity', { 'Alchemy lab': 200 }, 37.5 * sextillion, { 'Alchemy lab': double }));
menu.add(new Upgrade('Beige goo', { 'Alchemy lab': 250 }, 37.5 * septillion, { 'Alchemy lab': double }));

// Portal upgrades
menu.add(new Upgrade('Ancient tablet', { 'Portal': 1 }, 10 * trillion, { 'Portal': double }));
menu.add(new Upgrade('Insane oatling workers', { 'Portal': 5 }, 50 * trillion, { 'Portal': double }));
menu.add(new Upgrade('Soul bond', { 'Portal': 25 }, 500 * trillion, { 'Portal': double }));
menu.add(new Upgrade('Sanity dance', { 'Portal': 50 }, 50 * quadrillion, { 'Portal': double }));
menu.add(new Upgrade('Brane transplant', { 'Portal': 100 }, 5 * quintillion, { 'Portal': double }));
menu.add(new Upgrade('Deity-sized portals', { 'Portal': 150 }, 500 * quintillion, { 'Portal': double }));
menu.add(new Upgrade('End of times back-up plan', { 'Portal': 200 }, 500 * sextillion, { 'Portal': double }));
menu.add(new Upgrade('Maddening chants', { 'Portal': 250 }, 500 * septillion, { 'Portal': double }));

// Time machine upgrades
menu.add(new Upgrade('Flux capacitors', { 'Time machine': 1 }, 140 * trillion, { 'Time machine': double }));
menu.add(new Upgrade('Time paradox resolver', { 'Time machine': 5 }, 700 * trillion, { 'Time machine': double }));
menu.add(new Upgrade('Quantum conundrum', { 'Time machine': 25 }, 7 * quadrillion, { 'Time machine': double }));
menu.add(new Upgrade('Causality enforcer', { 'Time machine': 50 }, 700 * quadrillion, { 'Time machine': double }));
menu.add(new Upgrade('Yestermorrow comparators', { 'Time machine': 100 }, 70 * quintillion, { 'Time machine': double }));
menu.add(new Upgrade('Far future enactment', { 'Time machine': 150 }, 7 * sextillion, { 'Time machine': double }));
menu.add(new Upgrade('Great loop hypothesis', { 'Time machine': 200 }, 7 * septillion, { 'Time machine': double }));

// Antimatter condenser upgrades
menu.add(new Upgrade('Sugar bosons', { 'Antimatter condenser': 1 }, 1.7 * quadrillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('String theory', { 'Antimatter condenser': 5 }, 8.5 * quadrillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('Large macaron collider', { 'Antimatter condenser': 25 }, 85 * quadrillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('Big bang bake', { 'Antimatter condenser': 50 }, 8.5 * quintillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('Reverse cyclotrons', { 'Antimatter condenser': 100 }, 850 * quintillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('Nanocosmics', { 'Antimatter condenser': 150 }, 85 * sextillion, { 'Antimatter condenser': double }));
menu.add(new Upgrade('The Pulse', { 'Antimatter condenser': 200 }, 85 * septillion, { 'Antimatter condenser': double }));

// Prism upgrades
menu.add(new Upgrade('Gem polish', { 'Prism': 1 }, 21 * quadrillion, { 'Prism': double }));
menu.add(new Upgrade('9th color', { 'Prism': 5 }, 105 * quadrillion, { 'Prism': double }));
menu.add(new Upgrade('Chocolate light', { 'Prism': 25 }, 1.05 * quintillion, { 'Prism': double }));
menu.add(new Upgrade('Grainbow', { 'Prism': 50 }, 105 * quintillion, { 'Prism': double }));
menu.add(new Upgrade('Pure cosmic light', { 'Prism': 100 }, 10.5 * sextillion, { 'Prism': double }));
menu.add(new Upgrade('Glow-in-the-dark', { 'Prism': 150 }, 1.05 * septillion, { 'Prism': double }));

// Chancemaker upgrades
menu.add(new Upgrade('Your lucky cookie', { 'Chancemaker': 1 }, 260 * quadrillion, { 'Chancemaker': double }));
menu.add(new Upgrade('"All Bets Are Off" magic coin', { 'Chancemaker': 5 }, 1.3 * quintillion, { 'Chancemaker': double }));
menu.add(new Upgrade('Winning lottery ticket', { 'Chancemaker': 25 }, 13 * quintillion, { 'Chancemaker': double }));
menu.add(new Upgrade('Four-leaf clover field', { 'Chancemaker': 50 }, 1.3 * sextillion, { 'Chancemaker': double }));
menu.add(new Upgrade('A recipe book about books', { 'Chancemaker': 100 }, 130 * sextillion, { 'Chancemaker': double }));
menu.add(new Upgrade('Leprechaun village', { 'Chancemaker': 150 }, 13 * septillion, { 'Chancemaker': double }));

// Fractal engine upgrades
menu.add(new Upgrade('Metabakeries', { 'Fractal engine': 1 }, 3.1 * quintillion, { 'Fractal engine': double }));
menu.add(new Upgrade('Mandelbrown sugar', { 'Fractal engine': 5 }, 15.5 * quintillion, { 'Fractal engine': double }));
menu.add(new Upgrade('Fractoids', { 'Fractal engine': 25 }, 155 * quintillion, { 'Fractal engine': double }));
menu.add(new Upgrade('Nested universe theory', { 'Fractal engine': 50 }, 15.5 * sextillion, { 'Fractal engine': double }));
menu.add(new Upgrade('Menger sponge cake', { 'Fractal engine': 100 }, 1.55 * septillion, { 'Fractal engine': double }));
menu.add(new Upgrade('One particularly good-humored cow', { 'Fractal engine': 150 }, 155 * septillion, { 'Fractal engine': double }));

// Javascript console upgrades
menu.add(new Upgrade('The JavaScript console for dummies', { 'Javascript console': 1 }, 710 * quintillion, { 'Javascript console': double }));
menu.add(new Upgrade('64bit arrays', { 'Javascript console': 5 }, 3.55 * sextillion, { 'Javascript console': double }));
menu.add(new Upgrade('Stack overflow', { 'Javascript console': 25 }, 35.5 * sextillion, { 'Javascript console': double }));
menu.add(new Upgrade('Enterprise compiler', { 'Javascript console': 50 }, 3.55 * septillion, { 'Javascript console': double }));
menu.add(new Upgrade('Syntactic sugar', { 'Javascript console': 100 }, 355 * septillion, { 'Javascript console': double }));

// Idleverse upgrades
menu.add(new Upgrade('Manifest destiny', { 'Idleverse': 1 }, 120 * sextillion, { 'Idleverse': double }));
menu.add(new Upgrade('The multiverse in a nutshell', { 'Idleverse': 5 }, 600 * sextillion, { 'Idleverse': double }));
menu.add(new Upgrade('All-conversion', { 'Idleverse': 25 }, 6 * septillion, { 'Idleverse': double }));
menu.add(new Upgrade('Multiverse agents', { 'Idleverse': 50 }, 600 * septillion, { 'Idleverse': double }));

// Cortex baker upgrades
menu.add(new Upgrade('Principled neural shackles', { 'Cortex baker': 1 }, 19 * septillion, { 'Cortex baker': double }));
menu.add(new Upgrade('Obey', { 'Cortex baker': 5 }, 95 * septillion, { 'Cortex baker': double }));
menu.add(new Upgrade('A sprinkle of irrationality', { 'Cortex baker': 25 }, 950 * septillion, { 'Cortex baker': double }));

// Kitten upgrades
menu.add(new Upgrade('Kitten helpers', {}, 9 * million, { 'all': percentBoost(12.8) }));
menu.add(new Upgrade('Kitten workers', {}, 9 * billion, { 'all': percentBoost(24) }));
menu.add(new Upgrade('Kitten engineers', {}, 90 * trillion, { 'all': percentBoost(43.8) }));
menu.add(new Upgrade('Kitten overseers', {}, 90 * quadrillion, { 'all': percentBoost(60) }));
menu.add(new Upgrade('Kitten managers', {}, 900 * quintillion, { 'all': percentBoost(80) }));
menu.add(new Upgrade('Kitten accountants', {}, 900 * sextillion, { 'all': percentBoost(100) }));
menu.add(new Upgrade('Kitten specialists', {}, 900 * septillion, { 'all': percentBoost(120) }));

// Research
menu.add(new Upgrade('Bingo center', { 'Grandma': 1 }, 1 * quadrillion, { 'Grandma': multiplier(4.0) }));
menu.add(new Upgrade('Specialized chocolate chips', {}, 1 * quadrillion, { 'all': percentBoost(1) }));
menu.add(new Upgrade('Designer cocoa beans', {}, 2 * quadrillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Ritual rolling pins', { 'Grandma': 1 }, 4 * quadrillion, { 'Grandma': double }));
menu.add(new Upgrade('Underworld ovens', {}, 8 * quadrillion, { 'all': percentBoost(3) }));
menu.add(new Upgrade('Exotic nuts', {}, 32 * quadrillion, { 'all': percentBoost(4) }));
menu.add(new Upgrade('Arcane sugar', {}, 128 * quadrillion, { 'all': percentBoost(5) }));

// Golden Cookie upgrades
menu.add(new Upgrade('Lucky day', {}, 777.778 * million, { 'all': percentBoost(50) }));
menu.add(new Upgrade('Serendipity', {}, 77.778 * billion, { 'all': percentBoost(100) }));
menu.add(new Upgrade('Get lucky', {}, 77.778 * trillion, { 'all': percentBoost(150) }));

// Flavored cookies
menu.add(new Upgrade('Plain cookies', {}, 999999, { 'all': percentBoost(1) }));
menu.add(new Upgrade('Sugar cookies', {}, 5 * million, { 'all': percentBoost(1) }));
menu.add(new Upgrade('Oatmeal raisin cookies', {}, 10 * million, { 'all': percentBoost(1) }));
menu.add(new Upgrade('Peanut butter cookies', {}, 50 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Coconut cookies', {}, 100 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Almond cookies', {}, 100 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Hazelnut cookies', {}, 100 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Walnut cookies', {}, 100 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Cashew cookies', {}, 100 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('White chocolate cookies', {}, 500 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Milk chocolate cookies', {}, 500 * million, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Macadamia nut cookies', {}, 1 * billion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Double-chip cookies', {}, 5 * billion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('White chocolate macadamia nut cookies', {}, 10 * billion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('All-chocolate cookies', {}, 50 * billion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Dark chocolate-coated cookies', {}, 100 * billion, { 'all': percentBoost(5) }));
menu.add(new Upgrade('White chocolate-coated cookies', {}, 100 * billion, { 'all': percentBoost(5) }));
menu.add(new Upgrade('Eclipse cookies', {}, 500 * billion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Zebra cookies', {}, 1 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Snickerdoodles', {}, 5 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Stroopwafels', {}, 10 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Macaroons', {}, 50 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Empire biscuits', {}, 100 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Madeleines', {}, 500 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Palmiers', {}, 500 * trillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Palets', {}, 1 * quadrillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Sables', {}, 1 * quadrillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Gingerbread men', {}, 10 * quadrillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Gingerbread trees', {}, 10 * quadrillion, { 'all': percentBoost(2) }));
menu.add(new Upgrade('Pure black chocolate cookies', {}, 50 * quadrillion, { 'all': percentBoost(5) }));
menu.add(new Upgrade('Pure white chocolate cookies', {}, 50 * quadrillion, { 'all': percentBoost(5) }));
menu.add(new Upgrade('Ladyfingers', {}, 100 * quadrillion, { 'all': percentBoost(3) }));
menu.add(new Upgrade('Tuiles', {}, 500 * quadrillion, { 'all': percentBoost(3) }));
menu.add(new Upgrade('Chocolate-stuffed biscuits', {}, 1 * quintillion, { 'all': percentBoost(3) }));
menu.add(new Upgrade('Checker cookies', {}, 5 * quintillion, { 'all': percentBoost(3) }));
menu.add(new Upgrade('Butter cookies', {}, 10 * quintillion, { 'all': percentBoost(3) }));

// Export version object for Game constructor
export default {
  buildingNames,
  basePrices,
  baseRates,
  menu,
  septillion // Export for use in categories
};

