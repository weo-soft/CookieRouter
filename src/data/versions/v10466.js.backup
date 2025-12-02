/**
 * Cookie Clicker version v10466 data
 * Ported from Python v10466.py
 */

import { Upgrade, Effect } from '../../js/game.js';

const million = 10**6;
const billion = 10**9;
const trillion = 10**12;

export const buildingNames = [
  'Cursor',
  'Grandma',
  'Farm',
  'Factory',
  'Mine',
  'Shipment',
  'Alchemy lab',
  'Portal',
];

export const basePrices = {
  'Cursor': 15,
  'Grandma': 100,
  'Farm': 500,
  'Factory': 3000,
  'Mine': 10000,
  'Shipment': 40000,
  'Alchemy lab': 200000,
  'Portal': 1.667 * million,
};

export const baseRates = {
  'Cursor': 0.1,
  'Grandma': 0.5,
  'Farm': 4,
  'Factory': 10,
  'Mine': 40,
  'Shipment': 100,
  'Alchemy lab': 400,
  'Portal': 6666,
};

// Effects
function gain(x) {
  return new Effect(3, (r, game) => r + x);
}

function mult(x) {
  return new Effect(1, (r, game) => r * x);
}

const double = new Effect(2, (r, game) => r * 2);
const mouseType = new Effect(1, (r, game) => r + 0.01 * game.buildingOnlyRate());

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

// The set of all upgrades
export const menu = new Set();

// Kitten upgrades
menu.add(new Upgrade('Kitten helpers', {}, 9000000, { 'all': mult(1.1) }));

// Cursor & mouse upgrades
menu.add(new Upgrade('Reinforced index finger', { 'Cursor': 1 }, 100, { 'Cursor': gain(0.1), 'mouse': gain(1) }));
menu.add(new Upgrade('Carpel tunnel prevention cream', { 'Cursor': 1 }, 400, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Ambidextrous', { 'Cursor': 10 }, 10000, { 'Cursor': double, 'mouse': double }));
menu.add(new Upgrade('Thousand fingers', { 'Cursor': 20 }, 500000, { 'Cursor': fingersType(0.1), 'mouse': fingersType(0.1) }));
menu.add(new Upgrade('Million fingers', { 'Cursor': 40 }, 50 * million, { 'Cursor': fingersType(0.5), 'mouse': fingersType(0.5) }));

// Mouse only upgrades
menu.add(new Upgrade('Plastic mouse', {}, 50000, { 'mouse': mouseType }));
menu.add(new Upgrade('Iron mouse', {}, 5 * million, { 'mouse': mouseType }));

// Grandma upgrades
menu.add(new Upgrade('Forwards from grandma', { 'Grandma': 1 }, 1000, { 'Grandma': gain(0.3) }));
menu.add(new Upgrade('Steel-plated rolling pins', { 'Grandma': 1 }, 10000, { 'Grandma': double }));
menu.add(new Upgrade('Lubricated dentures', { 'Grandma': 10 }, 100000, { 'Grandma': double }));
menu.add(new Upgrade('Prune juice', { 'Grandma': 50 }, 5 * million, { 'Grandma': double }));

// Grandma type upgrades
menu.add(new Upgrade('Farmer grandmas', { 'Grandma': 1, 'Farm': 15 }, 50000, { 'Grandma': double }));
menu.add(new Upgrade('Worker grandmas', { 'Grandma': 1, 'Factory': 15 }, 300000, { 'Grandma': double }));
menu.add(new Upgrade('Miner grandmas', { 'Grandma': 1, 'Mine': 15 }, 1 * million, { 'Grandma': double }));

// Farm upgrades
menu.add(new Upgrade('Cheap hoes', { 'Farm': 1 }, 5000, { 'Farm': gain(1) }));
menu.add(new Upgrade('Fertilizer', { 'Farm': 1 }, 50000, { 'Farm': double }));
menu.add(new Upgrade('Cookie trees', { 'Farm': 10 }, 500000, { 'Farm': double }));
menu.add(new Upgrade('Genetically-modified cookies', { 'Farm': 50 }, 25 * million, { 'Farm': double }));

// Factory upgrades
menu.add(new Upgrade('Sturdier conveyor belts', { 'Factory': 1 }, 30000, { 'Factory': gain(4) }));
menu.add(new Upgrade('Child labor', { 'Factory': 1 }, 300000, { 'Factory': double }));
menu.add(new Upgrade('Sweatshop', { 'Factory': 10 }, 3 * million, { 'Factory': double }));

// Mine upgrades
menu.add(new Upgrade('Sugar gas', { 'Mine': 1 }, 100000, { 'Mine': gain(10) }));
menu.add(new Upgrade('Mega drill', { 'Mine': 1 }, 1 * million, { 'Mine': double }));
menu.add(new Upgrade('Ultradrill', { 'Mine': 10 }, 10 * million, { 'Mine': double }));

// Shipment upgrades
menu.add(new Upgrade('Vanilla nebulae', { 'Shipment': 1 }, 400000, { 'Shipment': gain(30) }));
menu.add(new Upgrade('Wormholes', { 'Shipment': 1 }, 4 * million, { 'Shipment': double }));

// Alchemy lab upgrades
menu.add(new Upgrade('Antimony', { 'Alchemy lab': 1 }, 2 * million, { 'Alchemy lab': gain(100) }));
menu.add(new Upgrade('Essence of dough', { 'Alchemy lab': 1 }, 20 * million, { 'Alchemy lab': double }));

// Portal upgrades
menu.add(new Upgrade('Ancient tablet', { 'Portal': 1 }, 16.667 * million, { 'Portal': gain(1666) }));
menu.add(new Upgrade('Insane oatling workers', { 'Portal': 1 }, 166.667 * million, { 'Portal': double }));

// Export version object for Game constructor
export default {
  buildingNames,
  basePrices,
  baseRates,
  menu
};

