/**
 * Cookie Clicker version v2031 data
 * Ported from Python v2031.py
 */

import { Upgrade, Effect } from '../../js/game.js';

const million = 10**6;
const billion = 10**9;
const trillion = 10**12;

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
};

// Effects
const double = new Effect(2, (r, game) => r * 2);

function grandmaType(n) {
  const func = (r, game) => r * (1 + 0.01 * Math.floor(game.numBuildings['Grandma'] / n));
  return new Effect(2, func);
}

function fingersType(x) {
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

const mouseType = new Effect(1, (r, game) => r + 0.01 * game.buildingOnlyRate());

// The set of all upgrades
export const menu = new Set();

// Cursor & mouse upgrades
menu.add(new Upgrade('Reinforced index finger', { 'Cursor': 1 }, 100, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Carpel tunnel prevention cream', { 'Cursor': 1 }, 500, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Ambidextrous', { 'Cursor': 10 }, 10000, { 'Cursor': double, 'mouse': double }));

// Mouse only upgrades
menu.add(new Upgrade('Plastic mouse', {}, 50000, { 'mouse': mouseType }));

// Grandma upgrades
menu.add(new Upgrade('Forwards from grandma', { 'Grandma': 1 }, 1000, { 'Grandma': double }));
menu.add(new Upgrade('Steel-plated rolling pins', { 'Grandma': 5 }, 5000, { 'Grandma': double }));
menu.add(new Upgrade('Lubricated dentures', { 'Grandma': 25 }, 50000, { 'Grandma': double }));
menu.add(new Upgrade('Prune juice', { 'Grandma': 50 }, 5 * million, { 'Grandma': double }));
menu.add(new Upgrade('Double-thick glasses', { 'Grandma': 100 }, 500 * million, { 'Grandma': double }));
menu.add(new Upgrade('Aging agents', { 'Grandma': 150 }, 50 * billion, { 'Grandma': double }));

// Grandma type upgrades
menu.add(new Upgrade('Farmer grandmas', { 'Grandma': 1, 'Farm': 15 }, 55000, { 'Grandma': double, 'Farm': grandmaType(1) }));
menu.add(new Upgrade('Miner grandmas', { 'Grandma': 1, 'Mine': 15 }, 600000, { 'Grandma': double, 'Mine': grandmaType(2) }));
menu.add(new Upgrade('Worker grandmas', { 'Grandma': 1, 'Factory': 15 }, 6.5 * million, { 'Grandma': double, 'Factory': grandmaType(3) }));
menu.add(new Upgrade('Banker grandmas', { 'Grandma': 1, 'Bank': 15 }, 70 * million, { 'Grandma': double, 'Bank': grandmaType(4) }));
menu.add(new Upgrade('Priestess grandmas', { 'Grandma': 1, 'Temple': 15 }, 1 * billion, { 'Grandma': double, 'Temple': grandmaType(5) }));
menu.add(new Upgrade('Witch grandmas', { 'Grandma': 1, 'Wizard tower': 15 }, 16.5 * billion, { 'Grandma': double, 'Wizard tower': grandmaType(6) }));
menu.add(new Upgrade('Cosmic grandmas', { 'Grandma': 1, 'Shipment': 15 }, 255 * billion, { 'Grandma': double, 'Shipment': grandmaType(7) }));

// Farm upgrades
menu.add(new Upgrade('Cheap hoes', { 'Farm': 1 }, 11000, { 'Farm': double }));
menu.add(new Upgrade('Fertilizer', { 'Farm': 5 }, 55000, { 'Farm': double }));
menu.add(new Upgrade('Cookie trees', { 'Farm': 25 }, 550000, { 'Farm': double }));
menu.add(new Upgrade('Genetically-modified cookies', { 'Farm': 50 }, 55 * million, { 'Farm': double }));
menu.add(new Upgrade('Gingerbread scarecrows', { 'Farm': 100 }, 5.5 * billion, { 'Farm': double }));
menu.add(new Upgrade('Pulsar sprinklers', { 'Farm': 150 }, 550 * billion, { 'Farm': double }));

// Mine upgrades
menu.add(new Upgrade('Sugar gas', { 'Mine': 1 }, 120000, { 'Mine': double }));
menu.add(new Upgrade('Mega drill', { 'Mine': 5 }, 600000, { 'Mine': double }));
menu.add(new Upgrade('Ultradrill', { 'Mine': 25 }, 6 * million, { 'Mine': double }));
menu.add(new Upgrade('Ultimadrill', { 'Mine': 50 }, 600 * million, { 'Mine': double }));
menu.add(new Upgrade('H-bomb mining', { 'Mine': 100 }, 60 * billion, { 'Mine': double }));

// Factory upgrades
menu.add(new Upgrade('Sturdier conveyor belts', { 'Factory': 1 }, 1.3 * million, { 'Factory': double }));
menu.add(new Upgrade('Child labor', { 'Factory': 5 }, 6.5 * million, { 'Factory': double }));
menu.add(new Upgrade('Sweatshop', { 'Factory': 25 }, 65 * million, { 'Factory': double }));
menu.add(new Upgrade('Radium reactors', { 'Factory': 50 }, 6.5 * billion, { 'Factory': double }));
menu.add(new Upgrade('Recombobulators', { 'Factory': 100 }, 650 * billion, { 'Factory': double }));

// Bank upgrades
menu.add(new Upgrade('Taller tellers', { 'Bank': 1 }, 14 * million, { 'Bank': double }));
menu.add(new Upgrade('Scissor-resistant credit cards', { 'Bank': 5 }, 70 * million, { 'Bank': double }));
menu.add(new Upgrade('Acid-proof vaults', { 'Bank': 25 }, 700 * million, { 'Bank': double }));
menu.add(new Upgrade('Chocolate coins', { 'Bank': 50 }, 70 * billion, { 'Bank': double }));

// Temple upgrades
menu.add(new Upgrade('Golden idols', { 'Temple': 1 }, 200 * million, { 'Temple': double }));
menu.add(new Upgrade('Sacrifices', { 'Temple': 5 }, 1 * billion, { 'Temple': double }));
menu.add(new Upgrade('Delicious blessing', { 'Temple': 25 }, 10 * billion, { 'Temple': double }));

// Wizard tower upgrades
menu.add(new Upgrade('Pointier hats', { 'Wizard tower': 1 }, 3.3 * billion, { 'Wizard tower': double }));
menu.add(new Upgrade('Beardlier beards', { 'Wizard tower': 5 }, 16.5 * billion, { 'Wizard tower': double }));
menu.add(new Upgrade('Ancient grimoires', { 'Wizard tower': 25 }, 165 * billion, { 'Wizard tower': double }));

// Shipment upgrades
menu.add(new Upgrade('Vanilla nebulae', { 'Shipment': 1 }, 51 * billion, { 'Shipment': double }));
menu.add(new Upgrade('Wormholes', { 'Shipment': 5 }, 255 * billion, { 'Shipment': double }));

// Alchemy lab upgrades
menu.add(new Upgrade('Antimony', { 'Alchemy lab': 1 }, 750 * billion, { 'Alchemy lab': double }));

// Export version object for Game constructor
export default {
  buildingNames,
  basePrices,
  baseRates,
  menu
};

