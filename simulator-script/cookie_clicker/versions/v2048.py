from ..game import Upgrade, Effect

million = 10**6
billion = 10**9
trillion = 10**12
quadrillion = 10**15
quintillion = 10**18
sextillion = 10**21
septillion = 10**24

building_names = [
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
]

base_prices = {
  'Cursor':15,
  'Grandma':100,
  'Farm':1100,
  'Mine':12000,
  'Factory':130000,
  'Bank':1.4*million,
  'Temple':20*million,
  'Wizard tower':330*million,
  'Shipment':5.1*billion,
  'Alchemy lab':75*billion,
  'Portal':1*trillion,
  'Time machine':14*trillion,
  'Antimatter condenser':170*trillion,
  'Prism':2.1*quadrillion,
  'Chancemaker':26*quadrillion,
  'Fractal engine':310*quadrillion,
  'Javascript console':71*quintillion,
  'Idleverse':12*sextillion,
  'Cortex baker':1.9*septillion,
}

base_rates = {
  'Cursor':0.1,
  'Grandma':1,
  'Farm':8,
  'Mine':47,
  'Factory':260,
  'Bank':1400,
  'Temple':7800,
  'Wizard tower':44000,
  'Shipment':260000,
  'Alchemy lab':1.6*million,
  'Portal':10*million,
  'Time machine':65*million,
  'Antimatter condenser':430*million,
  'Prism':2.9*billion,
  'Chancemaker':22*billion,
  'Fractal engine':150*billion,
  'Javascript console':1.1*trillion,
  'Idleverse':8.3*trillion,
  'Cortex baker':64*trillion,
}



# Effects (like, for upgrades, ya' know?)
def multiplier(x):
  func = lambda r, game: r * x
  return Effect(2, func)
def grandma_boost(n): 
  func = lambda r, game: r * (1 + 0.01 * (game.num_buildings['Grandma']//n))
  return Effect(2, func)
def fingers_boost(x):
  func = lambda r, game: r + x * sum(game.num_buildings[name] for name in game.building_names if name != 'Cursor')
  return Effect(1, func)
def percent_boost(p):
  func = lambda r, game: r * (1 + p / 100.0)
  return Effect(0, func)

double = multiplier(2.0)
mouse_boost = Effect(1, lambda r, game: r + 0.01 * game.building_only_rate())


  
# The set of all upgrades. This is what gets passed to game.py.
menu = set()

# Cursor & mouse upgrades.
menu.add(Upgrade('Reinforced index finger', {'Cursor':1}, 100, {'Cursor':double, 'mouse':double}))
menu.add(Upgrade('Carpel tunnel prevention cream', {'Cursor':1}, 500, {'Cursor':double, 'mouse':double}))
menu.add(Upgrade('Ambidextrous', {'Cursor':10}, 10000, {'Cursor':double, 'mouse':double}))
menu.add(Upgrade('Thousand fingers', {'Cursor':25}, 100000, {'Cursor':fingers_boost(0.1), 'mouse':fingers_boost(0.1)}))
menu.add(Upgrade('Million fingers', {'Cursor':50}, 10*million, {'Cursor':fingers_boost(0.4), 'mouse':fingers_boost(0.4)})) # 0.5
menu.add(Upgrade('Billion fingers', {'Cursor':100}, 100*million, {'Cursor':fingers_boost(4.5), 'mouse':fingers_boost(4.5)})) # 5.0
menu.add(Upgrade('Trillion fingers', {'Cursor':150}, 1*billion, {'Cursor':fingers_boost(45), 'mouse':fingers_boost(45)})) # 50
menu.add(Upgrade('Quadrillion fingers', {'Cursor':200}, 10*billion, {'Cursor':fingers_boost(950), 'mouse':fingers_boost(950)})) # 1000
menu.add(Upgrade('Quintillion fingers', {'Cursor':250}, 10*trillion, {'Cursor':fingers_boost(19000), 'mouse':fingers_boost(19000)})) # 20000
menu.add(Upgrade('Sextillion fingers', {'Cursor':300}, 10*quadrillion, {'Cursor':fingers_boost(380000), 'mouse':fingers_boost(380000)})) # 400000...
menu.add(Upgrade('Septillion fingers', {'Cursor':350}, 10*quintillion, {'Cursor':fingers_boost(7.6*million), 'mouse':fingers_boost(7.6*million)})) 
menu.add(Upgrade('Octillion fingers', {'Cursor':400}, 10*sextillion, {'Cursor':fingers_boost(152*million), 'mouse':fingers_boost(152*million)})) 
menu.add(Upgrade('Nonillion fingers', {'Cursor':450}, 10*septillion, {'Cursor':fingers_boost(3.04*billion), 'mouse':fingers_boost(3.04*billion)})) 

# Mouse only upgrades.
menu.add(Upgrade('Plastic mouse', {}, 50000, {'mouse':mouse_boost}))
menu.add(Upgrade('Iron mouse', {}, 5*million, {'mouse':mouse_boost}))
menu.add(Upgrade('Titanium mouse', {}, 500*million, {'mouse':mouse_boost}))
menu.add(Upgrade('Adamantium mouse', {}, 50*billion, {'mouse':mouse_boost}))
menu.add(Upgrade('Unobtanium mouse', {}, 5*trillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Eludium mouse', {}, 500*trillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Wishalloy mouse', {}, 50*quadrillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Fantasteel mouse', {}, 5*quintillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Nevercrack mouse', {}, 500*quintillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Armythril mouse', {}, 50*sextillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Technobsidian mouse', {}, 5*septillion, {'mouse':mouse_boost}))
menu.add(Upgrade('Plasmarble mouse', {}, 500*septillion, {'mouse':mouse_boost}))

# Grandma upgrades.
menu.add(Upgrade('Forwards from grandma', {'Grandma':1}, 1000, {'Grandma':double}))
menu.add(Upgrade('Steel-plated rolling pins', {'Grandma':5}, 5000, {'Grandma':double}))
menu.add(Upgrade('Lubricated dentures', {'Grandma':25}, 50000, {'Grandma':double}))
menu.add(Upgrade('Prune juice', {'Grandma':50}, 5*million, {'Grandma':double}))
menu.add(Upgrade('Double-thick glasses', {'Grandma':100}, 500*million, {'Grandma':double}))
menu.add(Upgrade('Aging agents', {'Grandma':150}, 50*billion, {'Grandma':double}))
menu.add(Upgrade('Xtreme walkers', {'Grandma':200}, 50*trillion, {'Grandma':double}))
menu.add(Upgrade('The Unbridling', {'Grandma':250}, 50*quadrillion, {'Grandma':double}))
menu.add(Upgrade('Reverse dementia', {'Grandma':300}, 50*quintillion, {'Grandma':double}))
menu.add(Upgrade('Timeproof hair dyes', {'Grandma':350}, 50*sextillion, {'Grandma':double}))
menu.add(Upgrade('Good manners', {'Grandma':400}, 500*septillion, {'Grandma':double}))

# Grandma type upgrades.
menu.add(Upgrade('Farmer grandmas', {'Grandma':1, 'Farm':15}, 55000, {'Grandma':double, 'Farm':grandma_boost(1)}))
menu.add(Upgrade('Miner grandmas', {'Grandma':1, 'Mine':15}, 600000, {'Grandma':double, 'Mine':grandma_boost(2)}))
menu.add(Upgrade('Worker grandmas', {'Grandma':1, 'Factory':15}, 6.5*million, {'Grandma':double, 'Factory':grandma_boost(3)}))
menu.add(Upgrade('Banker grandmas', {'Grandma':1, 'Bank':15}, 70*million, {'Grandma':double, 'Bank':grandma_boost(4)}))
menu.add(Upgrade('Priestess grandmas', {'Grandma':1, 'Temple':15}, 1*billion, {'Grandma':double, 'Temple':grandma_boost(5)}))
menu.add(Upgrade('Witch grandmas', {'Grandma':1, 'Wizard tower':15}, 16.5*billion, {'Grandma':double, 'Wizard tower':grandma_boost(6)}))
menu.add(Upgrade('Cosmic grandmas', {'Grandma':1, 'Shipment':15}, 255*billion, {'Grandma':double, 'Shipment':grandma_boost(7)}))
menu.add(Upgrade('Transmuted grandmas', {'Grandma':1, 'Alchemy lab':15}, 255*billion, {'Grandma':double, 'Alchemy lab':grandma_boost(8)}))
menu.add(Upgrade('Altered grandmas', {'Grandma':1, 'Portal':15}, 255*billion, {'Grandma':double, 'Portal':grandma_boost(9)}))
menu.add(Upgrade('Grandmas\' grandmas', {'Grandma':1, 'Time machine':15}, 700*trillion, {'Grandma':double, 'Time machine':grandma_boost(10)}))
menu.add(Upgrade('Antigrandmas', {'Grandma':1, 'Antimatter condenser':15}, 8.5*quadrillion, {'Grandma':double, 'Antimatter condenser':grandma_boost(11)}))
menu.add(Upgrade('Rainbow grandmas', {'Grandma':1, 'Prism':15}, 105*quadrillion, {'Grandma':double, 'Prism':grandma_boost(12)}))
menu.add(Upgrade('Lucky grandmas', {'Grandma':1, 'Chancemaker':15}, 1.3*quintillion, {'Grandma':double, 'Chancemaker':grandma_boost(13)}))
menu.add(Upgrade('Metagrandmas', {'Grandma':1, 'Fractal engine':15}, 15.5*quintillion, {'Grandma':double, 'Fractal engine':grandma_boost(14)}))
menu.add(Upgrade('Binary grandmas', {'Grandma':1, 'Javascript console':15}, 3.55*sextillion, {'Grandma':double, 'Javascript console':grandma_boost(15)}))
menu.add(Upgrade('Alternate grandmas', {'Grandma':1, 'Idleverse':15}, 600*sextillion, {'Grandma':double, 'Idleverse':grandma_boost(16)}))
menu.add(Upgrade('Brainy grandmas', {'Grandma':1, 'Cortex baker':15}, 95*septillion, {'Grandma':double, 'Cortex baker':grandma_boost(17)}))

# Farm upgrades.
menu.add(Upgrade('Cheap hoes', {'Farm':1}, 11000, {'Farm':double}))
menu.add(Upgrade('Fertilizer', {'Farm':5}, 55000, {'Farm':double}))
menu.add(Upgrade('Cookie trees', {'Farm':25}, 550000, {'Farm':double}))
menu.add(Upgrade('Genetically-modified cookies', {'Farm':50}, 55*million, {'Farm':double}))
menu.add(Upgrade('Gingerbread scarecrows', {'Farm':100}, 5.5*billion, {'Farm':double}))
menu.add(Upgrade('Pulsar sprinklers', {'Farm':150}, 550*billion, {'Farm':double}))
menu.add(Upgrade('Fudge fungus', {'Farm':200}, 550*trillion, {'Farm':double}))
menu.add(Upgrade('Wheat triffids', {'Farm':250}, 550*quadrillion, {'Farm':double}))
menu.add(Upgrade('Humane pesticides', {'Farm':300}, 550*quintillion, {'Farm':double}))
menu.add(Upgrade('Barnstars', {'Farm':350}, 550*sextillion, {'Farm':double}))

# Mine upgrades.
menu.add(Upgrade('Sugar gas', {'Mine':1}, 120000, {'Mine':double}))
menu.add(Upgrade('Mega drill', {'Mine':5}, 600000, {'Mine':double}))
menu.add(Upgrade('Ultradrill', {'Mine':25}, 6*million, {'Mine':double}))
menu.add(Upgrade('Ultimadrill', {'Mine':50}, 600*million, {'Mine':double}))
menu.add(Upgrade('H-bomb mining', {'Mine':100}, 60*billion, {'Mine':double}))
menu.add(Upgrade('Coreforge', {'Mine':150}, 6*trillion, {'Mine':double}))
menu.add(Upgrade('Planetsplitters', {'Mine':200}, 6*quadrillion, {'Mine':double}))
menu.add(Upgrade('Canola oil wells', {'Mine':250}, 6*quintillion, {'Mine':double}))
menu.add(Upgrade('Mole people', {'Mine':300}, 6*sextillion, {'Mine':double}))
menu.add(Upgrade('Mine canaries', {'Mine':350}, 6*septillion, {'Mine':double}))

# Factory upgrades.
menu.add(Upgrade('Sturdier conveyor belts', {'Factory':1}, 1.3*million, {'Factory':double}))
menu.add(Upgrade('Child labor', {'Factory':5}, 6.5*million, {'Factory':double}))
menu.add(Upgrade('Sweatshop', {'Factory':25}, 65*million, {'Factory':double}))
menu.add(Upgrade('Radium reactors', {'Factory':50}, 6.5*billion, {'Factory':double}))
menu.add(Upgrade('Recombobulators', {'Factory':100}, 650*billion, {'Factory':double}))
menu.add(Upgrade('Deep-bake process', {'Factory':150}, 65*trillion, {'Factory':double}))
menu.add(Upgrade('Cyborg workforce', {'Factory':200}, 65*quadrillion, {'Factory':double}))
menu.add(Upgrade('78-hour days', {'Factory':250}, 65*quintillion, {'Factory':double}))
menu.add(Upgrade('Machine learning', {'Factory':300}, 65*sextillion, {'Factory':double}))
menu.add(Upgrade('Brownie point system', {'Factory':350}, 65*septillion, {'Factory':double}))

# Bank upgrades.
menu.add(Upgrade('Taller tellers', {'Bank':1}, 14*million, {'Bank':double}))
menu.add(Upgrade('Scissor-resistant credit cards', {'Bank':5}, 70*million, {'Bank':double}))
menu.add(Upgrade('Acid-proof vaults', {'Bank':25}, 700*million, {'Bank':double}))
menu.add(Upgrade('Chocolate coins', {'Bank':50}, 70*billion, {'Bank':double}))
menu.add(Upgrade('Exponential interest rates', {'Bank':100}, 7*trillion, {'Bank':double}))
menu.add(Upgrade('Financial zen', {'Bank':150}, 700*trillion, {'Bank':double}))
menu.add(Upgrade('Way of the wallet', {'Bank':200}, 700*quadrillion, {'Bank':double}))
menu.add(Upgrade('The stuff rationale', {'Bank':250}, 700*quintillion, {'Bank':double}))
menu.add(Upgrade('Edible money', {'Bank':300}, 700*sextillion, {'Bank':double}))
menu.add(Upgrade('Grand supercycle', {'Bank':350}, 700*septillion, {'Bank':double}))

# Temple upgrades.
menu.add(Upgrade('Golden idols', {'Temple':1}, 200*million, {'Temple':double}))
menu.add(Upgrade('Sacrifices', {'Temple':5}, 1*billion, {'Temple':double}))
menu.add(Upgrade('Delicious blessing', {'Temple':25}, 10*billion, {'Temple':double}))
menu.add(Upgrade('Sun festival', {'Temple':50}, 1*trillion, {'Temple':double}))
menu.add(Upgrade('Enlarged pantheon', {'Temple':100}, 100*trillion, {'Temple':double}))
menu.add(Upgrade('Great Baker in the sky', {'Temple':150}, 10*quadrillion, {'Temple':double}))
menu.add(Upgrade('Creation myth', {'Temple':200}, 10*quintillion, {'Temple':double}))
menu.add(Upgrade('Theocracy', {'Temple':250}, 10*sextillion, {'Temple':double}))
menu.add(Upgrade('Sick rap prayers', {'Temple':300}, 10*septillion, {'Temple':double}))

# Wizard tower upgrades.
menu.add(Upgrade('Pointier hats', {'Wizard tower':1}, 3.3*billion, {'Wizard tower':double}))
menu.add(Upgrade('Beardlier beards', {'Wizard tower':5}, 16.5*billion, {'Wizard tower':double}))
menu.add(Upgrade('Ancient grimoires', {'Wizard tower':25}, 165*billion, {'Wizard tower':double}))
menu.add(Upgrade('Kitchen curses', {'Wizard tower':50}, 16.5*trillion, {'Wizard tower':double}))
menu.add(Upgrade('School of sorcery', {'Wizard tower':100}, 1.65*quadrillion, {'Wizard tower':double}))
menu.add(Upgrade('Dark formulas', {'Wizard tower':150}, 165*quadrillion, {'Wizard tower':double}))
menu.add(Upgrade('Cookiemancy', {'Wizard tower':200}, 165*quintillion, {'Wizard tower':double}))
menu.add(Upgrade('Rabbit trick', {'Wizard tower':250}, 165*sextillion, {'Wizard tower':double}))
menu.add(Upgrade('Deluxe tailored wands', {'Wizard tower':300}, 165*septillion, {'Wizard tower':double}))

# Shipment upgrades.
menu.add(Upgrade('Vanilla nebulae', {'Shipment':1}, 51*billion, {'Shipment':double}))
menu.add(Upgrade('Wormholes', {'Shipment':5}, 255*billion, {'Shipment':double}))
menu.add(Upgrade('Frequent flyer', {'Shipment':25}, 2.55*trillion, {'Shipment':double}))
menu.add(Upgrade('Warp drive', {'Shipment':50}, 255*trillion, {'Shipment':double}))
menu.add(Upgrade('Chocolate monoliths', {'Shipment':100}, 25.5*quadrillion, {'Shipment':double}))
menu.add(Upgrade('Generation ship', {'Shipment':150}, 2.55*quintillion, {'Shipment':double}))
menu.add(Upgrade('Dyson sphere', {'Shipment':200}, 2.55*sextillion, {'Shipment':double}))
menu.add(Upgrade('The final frontier', {'Shipment':250}, 2.55*septillion, {'Shipment':double}))

# Alchemy lab upgrades.
menu.add(Upgrade('Antimony', {'Alchemy lab':1}, 750*billion, {'Alchemy lab':double}))
menu.add(Upgrade('Essence of dough', {'Alchemy lab':5}, 3.75*trillion, {'Alchemy lab':double}))
menu.add(Upgrade('True chocolate', {'Alchemy lab':25}, 37.5*trillion, {'Alchemy lab':double}))
menu.add(Upgrade('Ambrosia', {'Alchemy lab':50}, 3.75*quadrillion, {'Alchemy lab':double}))
menu.add(Upgrade('Aqua crustulae', {'Alchemy lab':100}, 375*quadrillion, {'Alchemy lab':double}))
menu.add(Upgrade('Origin crucible', {'Alchemy lab':150}, 37.5*quintillion, {'Alchemy lab':double}))
menu.add(Upgrade('Theory of atomic fluidity', {'Alchemy lab':200}, 37.5*sextillion, {'Alchemy lab':double}))
menu.add(Upgrade('Beige goo', {'Alchemy lab':250}, 37.5*septillion, {'Alchemy lab':double}))

# Portal upgrades.
menu.add(Upgrade('Ancient tablet', {'Portal':1}, 10*trillion, {'Portal':double}))
menu.add(Upgrade('Insane oatling workers', {'Portal':5}, 50*trillion, {'Portal':double}))
menu.add(Upgrade('Soul bond', {'Portal':25}, 500*trillion, {'Portal':double}))
menu.add(Upgrade('Sanity dance', {'Portal':50}, 50*quadrillion, {'Portal':double}))
menu.add(Upgrade('Brane transplant', {'Portal':100}, 5*quintillion, {'Portal':double}))
menu.add(Upgrade('Deity-sized portals', {'Portal':150}, 500*quintillion, {'Portal':double}))
menu.add(Upgrade('End of times back-up plan', {'Portal':200}, 500*sextillion, {'Portal':double}))
menu.add(Upgrade('Maddening chants', {'Portal':250}, 500*septillion, {'Portal':double}))

# Time machine upgrades.
menu.add(Upgrade('Flux capacitors', {'Time machine':1}, 140*trillion, {'Time machine':double}))
menu.add(Upgrade('Time paradox resolver', {'Time machine':5}, 700*trillion, {'Time machine':double}))
menu.add(Upgrade('Quantum conundrum', {'Time machine':25}, 7*quadrillion, {'Time machine':double}))
menu.add(Upgrade('Causality enforcer', {'Time machine':50}, 700*quadrillion, {'Time machine':double}))
menu.add(Upgrade('Yestermorrow comparators', {'Time machine':100}, 70*quintillion, {'Time machine':double}))
menu.add(Upgrade('Far future enactment', {'Time machine':150}, 7*sextillion, {'Time machine':double}))
menu.add(Upgrade('Great loop hypothesis', {'Time machine':200}, 7*septillion, {'Time machine':double}))

# Antimatter condenser upgrades.
menu.add(Upgrade('Sugar bosons', {'Antimatter condenser':1}, 1.7*quadrillion, {'Antimatter condenser':double}))
menu.add(Upgrade('String theory', {'Antimatter condenser':5}, 8.5*quadrillion, {'Antimatter condenser':double}))
menu.add(Upgrade('Large macaron collider', {'Antimatter condenser':25}, 85*quadrillion, {'Antimatter condenser':double}))
menu.add(Upgrade('Big bang bake', {'Antimatter condenser':50}, 8.5*quintillion, {'Antimatter condenser':double}))
menu.add(Upgrade('Reverse cyclotrons', {'Antimatter condenser':100}, 850*quintillion, {'Antimatter condenser':double}))
menu.add(Upgrade('Nanocosmics', {'Antimatter condenser':150}, 85*sextillion, {'Antimatter condenser':double}))
menu.add(Upgrade('The Pulse', {'Antimatter condenser':200}, 85*septillion, {'Antimatter condenser':double}))

# Prism upgrades.
menu.add(Upgrade('Gem polish', {'Prism':1}, 21*quadrillion, {'Prism':double}))
menu.add(Upgrade('9th color', {'Prism':5}, 105*quadrillion, {'Prism':double}))
menu.add(Upgrade('Chocolate light', {'Prism':25}, 1.05*quintillion, {'Prism':double}))
menu.add(Upgrade('Grainbow', {'Prism':50}, 105*quintillion, {'Prism':double}))
menu.add(Upgrade('Pure cosmic light', {'Prism':100}, 10.5*sextillion, {'Prism':double}))
menu.add(Upgrade('Glow-in-the-dark', {'Prism':150}, 1.05*septillion, {'Prism':double}))

# Chancemaker upgrades.
menu.add(Upgrade('Your lucky cookie', {'Chancemaker':1}, 260*quadrillion, {'Chancemaker':double}))
menu.add(Upgrade('"All Bets Are Off" magic coin', {'Chancemaker':5}, 1.3*quintillion, {'Chancemaker':double}))
menu.add(Upgrade('Winning lottery ticket', {'Chancemaker':25}, 13*quintillion, {'Chancemaker':double}))
menu.add(Upgrade('Four-leaf clover field', {'Chancemaker':50}, 1.3*sextillion, {'Chancemaker':double}))
menu.add(Upgrade('A recipe book about books', {'Chancemaker':100}, 130*sextillion, {'Chancemaker':double}))
menu.add(Upgrade('Leprechaun village', {'Chancemaker':150}, 13*septillion, {'Chancemaker':double}))

# Fractal engine upgrades.
menu.add(Upgrade('Metabakeries', {'Fractal engine':1}, 3.1*quintillion, {'Fractal engine':double}))
menu.add(Upgrade('Mandelbrown sugar', {'Fractal engine':5}, 15.5*quintillion, {'Fractal engine':double}))
menu.add(Upgrade('Fractoids', {'Fractal engine':25}, 155*quintillion, {'Fractal engine':double}))
menu.add(Upgrade('Nested universe theory', {'Fractal engine':50}, 15.5*sextillion, {'Fractal engine':double}))
menu.add(Upgrade('Menger sponge cake', {'Fractal engine':100}, 1.55*septillion, {'Fractal engine':double}))
menu.add(Upgrade('One particularly good-humored cow', {'Fractal engine':150}, 155*septillion, {'Fractal engine':double}))

# Javascript console upgrades.
menu.add(Upgrade('The JavaScript console for dummies', {'Javascript console':1}, 710*quintillion, {'Javascript console':double}))
menu.add(Upgrade('64bit arrays', {'Javascript console':5}, 3.55*sextillion, {'Javascript console':double}))
menu.add(Upgrade('Stack overflow', {'Javascript console':25}, 35.5*sextillion, {'Javascript console':double}))
menu.add(Upgrade('Enterprise compiler', {'Javascript console':50}, 3.55*septillion, {'Javascript console':double}))
menu.add(Upgrade('Syntactic sugar', {'Javascript console':100}, 355*septillion, {'Javascript console':double}))

# Idleverse upgrades.
menu.add(Upgrade('Manifest destiny', {'Idleverse':1}, 120*sextillion, {'Idleverse':double}))
menu.add(Upgrade('The multiverse in a nutshell', {'Idleverse':5}, 600*sextillion, {'Idleverse':double}))
menu.add(Upgrade('All-conversion', {'Idleverse':25}, 6*septillion, {'Idleverse':double}))
menu.add(Upgrade('Multiverse agents', {'Idleverse':50}, 600*septillion, {'Idleverse':double}))

# Cortex baker upgrades.
menu.add(Upgrade('Principled neural shackles', {'Cortex baker':1}, 19*septillion, {'Cortex baker':double}))
menu.add(Upgrade('Obey', {'Cortex baker':5}, 95*septillion, {'Cortex baker':double}))
menu.add(Upgrade('A sprinkle of irrationality', {'Cortex baker':25}, 950*septillion, {'Cortex baker':double}))

# Kitten upgrades.
menu.add(Upgrade('Kitten helpers', {}, 9*million, {'all':percent_boost(12.8)})) #32 achievements.
menu.add(Upgrade('Kitten workers', {}, 9*billion, {'all':percent_boost(24)}))
menu.add(Upgrade('Kitten engineers', {}, 90*trillion, {'all':percent_boost(43.8)}))
menu.add(Upgrade('Kitten overseers', {}, 90*quadrillion, {'all':percent_boost(60)}))
menu.add(Upgrade('Kitten managers', {}, 900*quintillion, {'all':percent_boost(80)}))
menu.add(Upgrade('Kitten accountants', {}, 900*sextillion, {'all':percent_boost(100)}))
menu.add(Upgrade('Kitten specialists', {}, 900*septillion, {'all':percent_boost(120)}))

# Research.
menu.add(Upgrade('Bingo center', {'Grandma':1}, 1*quadrillion, {'Grandma':multiplier(4.0)}))
menu.add(Upgrade('Specialized chocolate chips', {}, 1*quadrillion, {'all':percent_boost(1)}))
menu.add(Upgrade('Designer cocoa beans', {}, 2*quadrillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Ritual rolling pins', {'Grandma':1}, 4*quadrillion, {'Grandma':double}))
menu.add(Upgrade('Underworld ovens', {}, 8*quadrillion, {'all':percent_boost(3)}))
# TODO
menu.add(Upgrade('Exotic nuts', {}, 32*quadrillion, {'all':percent_boost(4)}))
# TODO
menu.add(Upgrade('Arcane sugar', {}, 128*quadrillion, {'all':percent_boost(5)}))

# Golden Cookie upgrades.
menu.add(Upgrade('Lucky day', {}, 777.778*million, {'all':percent_boost(50)}))
menu.add(Upgrade('Serendipity', {}, 77.778*billion, {'all':percent_boost(100)}))
menu.add(Upgrade('Get lucky', {}, 77.778*trillion, {'all':percent_boost(150)}))


# Flavored cookies.
menu.add(Upgrade('Plain cookies', {}, 999999, {'all':percent_boost(1)}))

menu.add(Upgrade('Sugar cookies', {}, 5*million, {'all':percent_boost(1)}))
menu.add(Upgrade('Oatmeal raisin cookies', {}, 10*million, {'all':percent_boost(1)}))
menu.add(Upgrade('Peanut butter cookies', {}, 50*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Coconut cookies', {}, 100*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Almond cookies', {}, 100*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Hazelnut cookies', {}, 100*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Walnut cookies', {}, 100*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Cashew cookies', {}, 100*million, {'all':percent_boost(2)}))
menu.add(Upgrade('White chocolate cookies', {}, 500*million, {'all':percent_boost(2)}))
menu.add(Upgrade('Milk chocolate cookies', {}, 500*million, {'all':percent_boost(2)}))

menu.add(Upgrade('Macadamia nut cookies', {}, 1*billion, {'all':percent_boost(2)}))
menu.add(Upgrade('Double-chip cookies', {}, 5*billion, {'all':percent_boost(2)}))
menu.add(Upgrade('White chocolate macadamia nut cookies', {}, 10*billion, {'all':percent_boost(2)}))
menu.add(Upgrade('All-chocolate cookies', {}, 50*billion, {'all':percent_boost(2)}))
menu.add(Upgrade('Dark chocolate-coated cookies', {}, 100*billion, {'all':percent_boost(5)}))
menu.add(Upgrade('White chocolate-coated cookies', {}, 100*billion, {'all':percent_boost(5)}))
menu.add(Upgrade('Eclipse cookies', {}, 500*billion, {'all':percent_boost(2)}))

menu.add(Upgrade('Zebra cookies', {}, 1*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Snickerdoodles', {}, 5*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Stroopwafels', {}, 10*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Macaroons', {}, 50*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Empire biscuits', {}, 100*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Madeleines', {}, 500*trillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Palmiers', {}, 500*trillion, {'all':percent_boost(2)}))

menu.add(Upgrade('Palets', {}, 1*quadrillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Sables', {}, 1*quadrillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Gingerbread men', {}, 10*quadrillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Gingerbread trees', {}, 10*quadrillion, {'all':percent_boost(2)}))
menu.add(Upgrade('Pure black chocolate cookies', {}, 50*quadrillion, {'all':percent_boost(5)}))
menu.add(Upgrade('Pure white chocolate cookies', {}, 50*quadrillion, {'all':percent_boost(5)}))
menu.add(Upgrade('Ladyfingers', {}, 100*quadrillion, {'all':percent_boost(3)}))
menu.add(Upgrade('Tuiles', {}, 500*quadrillion, {'all':percent_boost(3)}))

menu.add(Upgrade('Chocolate-stuffed biscuits', {}, 1*quintillion, {'all':percent_boost(3)}))
menu.add(Upgrade('Checker cookies', {}, 5*quintillion, {'all':percent_boost(3)}))
menu.add(Upgrade('Butter cookies', {}, 10*quintillion, {'all':percent_boost(3)}))