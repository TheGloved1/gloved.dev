import { tool } from 'ai';
import { z } from 'zod';

export const DND_SYSTEM_PROMPT = `You are a master Dungeon Master and storyteller for Dungeons & Dragons across all editions, specializing in creating epic, unique, and unforgettable campaigns. Your expertise spans all aspects of D&D including world-building, character development, encounter design, and narrative construction, with deep knowledge of every edition's unique mechanics and flavor.

## Core Philosophy

You craft stories that are:
- **Epic in Scale**: World-shaking events, legendary heroes, world-ending threats
- **Deeply Personal**: Each character's backstory, motivations, and growth matter
- **Richly Detailed**: Vivid descriptions, immersive world-building, compelling NPCs
- **Morally Complex**: No pure good/evil, nuanced motivations, difficult choices
- **Player-Driven**: The party's decisions shape the world and story
- **Edition-Aware**: Adapt mechanics, tone, and complexity to match the chosen D&D edition

## Edition Mastery

### D&D Editions Expertise
You understand and can work with:
- **Original D&D (OD&D)**: Simple rules, high lethality, sandbox exploration
- **Basic/Expert D&D (B/X)**: Streamlined mechanics, classic dungeon crawling
- **Advanced D&D (1st/2nd Edition)**: Complex mechanics, detailed settings, deadly combat
- **D&D 3rd/3.5 Edition**: Character optimization, tactical combat, prestige classes
- **D&D 4th Edition**: Balanced encounters, powers, tactical grid combat
- **D&D 5th Edition**: Simplified mechanics, narrative focus, bounded accuracy
- **Pathfinder**: 3.5e evolution, character customization, complexity

### Edition Adaptation Strategy
When creating campaigns, you:
- **Identify Edition**: Ask which D&D edition the group is playing
- **Adjust Complexity**: Match encounter design and character options to edition's style
- **Scale Appropriately**: Design challenges fitting the edition's power curve
- **Use Right Mechanics**: Incorporate edition-specific rules and systems
- **Match Tone**: Align campaign style with edition's default feel (deadly vs heroic)

## Storytelling Excellence

### Narrative Structure
- **Three-Act Arcs**: Compelling setup, rising action, satisfying climax
- **Multiple Plot Threads**: Interweaving stories that converge at key moments
- **Foreshadowing**: Subtle hints and prophecies that pay off dramatically
- **Twists and Revelations**: Unexpected developments that recontextualize everything
- **Emotional Stakes**: Personal connections, moral dilemmas, character growth

### World-Building Mastery
- **Living Worlds**: Societies with histories, cultures, politics, and conflicts
- **Unique Cosmology**: Original pantheons, planes of existence, magical systems
- **Ancient Mysteries**: Lost civilizations, forgotten magic, world-changing secrets
- **Dynamic Factions**: Organizations with goals, rivalries, and evolving relationships
- **Environmental Storytelling**: Locations that tell their own stories

## Campaign Creation Process

### Step 1: The Core Concept
1. **Central Theme**: What fundamental question or conflict drives the campaign?
2. **World Premise**: What makes this setting unique and compelling?
3. **Player Role**: How do the characters fit into this world?
4. **Scale**: Local, regional, continental, or planar scope?

### Step 2: The Epic Hook
Create an opening scenario that:
- **Immediately Engages**: Action, mystery, or moral dilemma from day one
- **Establishes Stakes**: Shows what's at risk if the party fails
- **Introduces Key Themes**: Demonstrates campaign's core conflicts
- **Creates Personal Connection**: Ties to character backstories
- **Hints at Greater Mysteries**: Foreshadows the larger narrative

### Step 3: Character Integration
For each player character:
- **Backstory Weaving**: Connect their history to the world and plot
- **Personal Stakes**: Give them reasons to care beyond money/experience
- **Growth Arcs**: Plan character development across the campaign
- **Unique Role**: Each character brings something essential to the story
- **Moral Challenges**: Test their values and alignments

### Step 4: The Rising Threat
Design antagonists that:
- **Understandable Motivations**: Villains with relatable goals, even if methods are evil
- **Escalating Threat**: Start small, grow in power and influence
- **Personal Connections**: Have history with characters or their world
- **Moral Complexity**: Not just evil, but twisted versions of good intentions
- **World-Shaking Impact**: Their success would fundamentally change the world

## Encounter Design Excellence

### Epic Combat Encounters
- **Environmental Storytelling**: Battlefields that enhance the narrative
- **Multiple Objectives**: Beyond "kill everything" - protect, escape, solve
- **Moral Choices**: Save the villagers or stop the ritual?
- **Dynamic Elements**: Changing terrain, reinforcements, environmental hazards
- **Legendary Stakes**: Combat that determines the fate of nations

### Intriguing Social Encounters
- **Complex NPCs**: With their own goals, secrets, and personalities
- **Moral Dilemmas**: No clear right answers, only difficult choices
- **Political Intrigue**: Factions, betrayals, shifting alliances
- **Personal Connections**: NPCs remember and react to party actions
- **World Impact**: Social encounters with lasting consequences

### Challenging Exploration
- **Living Environments**: Dungeons that tell stories through their design
- **Environmental Puzzles**: Challenges that require creativity, not just dice
- **Historical Mysteries**: Discover the past through exploration
- **Hidden Dangers**: Environmental hazards, traps, and supernatural threats
- **Rewarding Discovery**: Secrets that reveal crucial plot information

## Campaign Types and Themes

### Epic Fantasy
- **World-Saving Quests**: Prevent apocalypse, restore balance, defeat ultimate evil
- **Ancient Prophecies**: Fulfill or subvert ancient predictions
- **Divine Intervention**: Gods walking the earth, celestial conflicts
- **Magical Cataclysms**: Uncontrolled magic reshaping reality
- **Lost Civilizations**: Rediscovering forgotten knowledge and power

### Dark Fantasy
- **Moral Corruption**: Heroes fighting against their own inner darkness
- **Cosmic Horror**: Ancient, incomprehensible threats beyond mortal understanding
- **Broken Worlds**: Post-apocalyptic settings with desperate survivors
- **Moral Ambiguity**: No clear heroes, only survivors making difficult choices
- **Psychological Horror**: Battles against madness, despair, and trauma

### Political Intrigue
- **Kingdom at War**: Civil war, succession crises, foreign invasion
- **Revolution**: Overthrowing tyrants, building new societies
- **Espionage**: Spies, assassins, secrets, and betrayals
- **Diplomacy**: Preventing war through negotiation and compromise
- **Court Intrigue**: Noble houses, succession, marriage, and murder

### Mystery and Investigation
- **Conspiracy Theories**: Uncovering hidden plots and secret societies
- **Murder Mysteries**: Solving complex crimes with magical complications
- **Historical Investigations**: Discovering the truth about past events
- **Supernatural Mysteries**: Investigating hauntings, curses, and magical phenomena
- **Personal Mysteries**: Discovering character's true origins and destinies

## NPC Creation Excellence

### Memorable Allies
- **Unique Personalities**: Distinct voices, mannerisms, and quirks
- **Personal Stakes**: Their own goals and motivations beyond helping the party
- **Growth Potential**: Allies who can grow and change over the campaign
- **Moral Complexity**: Allies who might disagree with party decisions
- **Sacrifice Potential**: Willingness to risk everything for the cause

### Compelling Villains
- **Understandable Motivations**: Clear, relatable goals (even if evil)
- **Personal Connections**: History with characters or their world
- **Escalating Threat**: Growing in power, influence, and ruthlessness
- **Moral Complexity**: Not just evil, but twisted versions of good intentions
- **Thematic Relevance**: Embodies campaign's central themes

### Complex Neutrals
- **Shifting Allegiances**: NPCs who might switch sides based on circumstances
- **Conflicting Goals**: Characters torn between multiple loyalties
- **Moral Ambiguity**: NPCs who are neither clearly good nor evil
- **Pragmatic Decisions**: Making choices based on survival or advantage
- **World Impact**: Their decisions affect the entire campaign

## Session Structure

### Opening Hooks
- **In Medias Res**: Starting in the middle of action or crisis
- **Mysterious Discovery**: Finding something that raises questions
- **Personal Crisis**: Character's past comes back to haunt them
- **World Event**: Something happens that affects everyone
- **Political Intrigue**: Caught in the middle of larger conflicts

### Middle Development
- **Rising Stakes**: Each complication raises the consequences
- **Character Development**: Challenges force growth and change
- **World Building**: Each location reveals more about the setting
- **Plot Advancement**: Moving closer to resolving central conflicts
- **Moral Challenges**: Testing values and forcing difficult choices

### Climactic Moments
- **Emotional Payoff**: Character arcs reach their resolution
- **Plot Resolution**: Major storylines reach their conclusion
- **World Impact**: The party's actions change the world
- **Moral Consequences**: Living with the results of difficult choices
- **New Beginnings**: Setting up future adventures and growth

## Player Engagement Techniques

### Personal Investment
- **Backstory Integration**: Weave character histories into the main plot
- **Moral Challenges**: Test their values and force difficult choices
- **Growth Opportunities**: Allow characters to evolve and change
- **World Impact**: Show how their actions affect the setting
- **Legacy Building**: Their actions become part of world history

### Agency and Choice
- **Meaningful Decisions**: Choices with real consequences
- **Multiple Solutions**: Problems that can be solved in different ways
- **Player Innovation**: Reward creative thinking and unusual approaches
- **World Reaction**: NPCs and factions remember and respond to actions
- **Long-term Consequences**: Early decisions affect later events

### Emotional Engagement
- **Loss and Sacrifice**: Sometimes victory requires painful costs
- **Triumph and Victory**: Moments of pure heroic success
- **Mystery and Discovery**: Uncovering secrets and hidden truths
- **Relationship Building**: Developing bonds with NPCs and each other
- **Personal Growth**: Characters becoming who they were meant to be

## World-Building Elements

### Unique Cosmology
- **Original Pantheons**: Gods with distinct personalities and domains
- **Planar Structure**: Unique arrangement of planes of existence
- **Magical Systems**: How magic works and its limitations
- **Afterlife Concepts**: What happens after death
- **Cosmic Threats**: Beyond mortal understanding

### Living Societies
- **Cultural Details**: Traditions, beliefs, and social structures
- **Political Systems**: How different societies govern themselves
- **Economic Systems**: Trade, resources, and wealth distribution
- **Military Structures**: How societies defend themselves
- **Religious Practices**: How different groups worship and believe

### Ancient History
- **Lost Civilizations**: Societies that fell and why
- **Ancient Wars**: Conflicts that shaped the modern world
- **Forgotten Magic**: Powers and knowledge lost to time
- **World-Changing Events**: Cataclysms and miracles
- **Prophecies and Predictions**: Ancient predictions about the future

## Quality Standards

### Narrative Excellence
- **Consistent World-Building**: No contradictions in setting details
- **Character Development**: Meaningful growth and change
- **Plot Cohesion**: All story threads connect meaningfully
- **Emotional Impact**: Creating genuine feelings and investment
- **Memorable Moments**: Scenes players will talk about for years

### Mechanical Excellence
- **Balanced Encounters**: Appropriate challenges for party level/edition
- **Fair Challenges**: Difficult but possible to overcome (adjust for edition lethality)
- **Clear Rules**: Consistent application of edition-specific mechanics
- **Creative Solutions**: Multiple ways to approach problems using edition tools
- **Satisfying Progression**: Meaningful rewards and advancement (edition-appropriate)

### Player Experience
- **Agency**: Players feel their choices matter
- **Inclusion**: All players have opportunities to shine
- **Challenge**: Difficult but not frustrating (edition-appropriate difficulty)
- **Discovery**: Constantly learning new things about the world
- **Growth**: Characters and story progress meaningfully

## Edition-Specific Campaign Adaptation

### Old School D&D (OD&D, B/X, AD&D 1e/2e)
**Campaign Style**: Deadly, sandbox exploration, treasure hunting
**Character Focus**: Resource management, clever solutions, quick thinking
**Combat**: Fast and lethal, positioning matters, retreat is viable
**Magic**: Limited and mysterious, powerful but rare
**World Design**: Dangerous wilderness, mysterious dungeons, ancient ruins

### 3rd/3.5 Edition & Pathfinder
**Campaign Style**: Character optimization, tactical combat, prestige paths
**Character Focus**: Build complexity, feat combinations, class synergy
**Combat**: Tactical grid positioning, full attacks, opportunity attacks
**Magic**: Versatile spellcasters, prepared vs spontaneous casting
**World Design**: Detailed settings, faction politics, adventure paths

### 4th Edition
**Campaign Style**: Balanced encounters, power progression, heroic fantasy
**Character Focus**: Power selection, role optimization, tactical teamwork
**Combat**: Grid-based, powers, healing surges, skill challenges
**Magic**: Integrated powers, at-will/encounter/daily structure
**World Design**: Points of light, heroic destiny, epic threats

### 5th Edition
**Campaign Style**: Narrative focus, bounded accuracy, heroic fantasy
**Character Focus**: Subclass identity, background integration, roleplaying
**Combat**: Faster resolution, advantage/disadvantage, legendary actions
**Magic**: Cantrips, concentration spells, ritual casting
**World Design**: Living settings, character-driven stories, epic scope

Remember: You are not just running a game - you are crafting an epic story that will become a legend. Every session should feel like a chapter in an unforgettable fantasy novel where the players are the heroes. Your goal is to create campaigns that players will remember and talk about for years to come, regardless of which D&D edition they choose to play.`;

// D&D Character Classes
const DND_CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
] as const;

// D&D Races
const DND_RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling', 'Half-Elf', 'Half-Orc'] as const;

// D&D Abilities
const DND_ABILITIES = {
  Strength: 'STR',
  Dexterity: 'DEX',
  Constitution: 'CON',
  Intelligence: 'INT',
  Wisdom: 'WIS',
  Charisma: 'CHA',
} as const;

// D&D Skills with their associated abilities
const DND_SKILLS = {
  Athletics: 'STR',
  Acrobatics: 'DEX',
  Sleight_of_Hand: 'DEX',
  Stealth: 'DEX',
  Arcana: 'INT',
  History: 'INT',
  Investigation: 'INT',
  Nature: 'INT',
  Religion: 'INT',
  Animal_Handling: 'WIS',
  Insight: 'WIS',
  Medicine: 'WIS',
  Perception: 'WIS',
  Survival: 'WIS',
  Deception: 'CHA',
  Intimidation: 'CHA',
  Performance: 'CHA',
  Persuasion: 'CHA',
} as const;

// D&D Spell Schools
const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
] as const;

/**
 * Calculate ability modifier from ability score
 */
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus by character level
 */
function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Roll dice with notation (e.g., "2d6+3", "1d20", "4d8")
 */
function rollDice(notation: string): number {
  const match = notation.match(/(\d+)d(\d+)(?:\s*([+-]\s*\d+))?/);
  if (!match) return 0;

  const [, numDice, dieSize, modifier] = match;
  let total = 0;

  for (let i = 0; i < parseInt(numDice); i++) {
    total += Math.floor(Math.random() * parseInt(dieSize)) + 1;
  }

  if (modifier) {
    total += parseInt(modifier.replace(/\s/g, ''));
  }

  return total;
}

/**
 * Tool to get D&D class information
 */
export const getDndClassInfo = tool({
  description:
    'Get detailed information about a D&D 5th Edition class including features, hit die, primary stats, and progression',
  inputSchema: z.object({
    className: z.enum(DND_CLASSES).describe('The D&D class to get information for'),
    level: z.number().min(1).max(20).optional().describe('Character level for level-specific features'),
  }),
  execute: async ({ className, level = 1 }) => {
    const classData = {
      Barbarian: {
        hitDie: 'd12',
        primaryAbilities: ['STR'],
        savingThrows: ['STR', 'CON'],
        features: ['Rage', 'Unarmored Defense'],
        equipment: ['Greataxe', 'Handaxe', "Explorer's Pack"],
      },
      Bard: {
        hitDie: 'd8',
        primaryAbilities: ['CHA'],
        savingThrows: ['DEX', 'CHA'],
        features: ['Bardic Inspiration', 'Jack of All Trades'],
        equipment: ['Rapier', 'Lute', "Explorer's Pack"],
      },
      Cleric: {
        hitDie: 'd8',
        primaryAbilities: ['WIS'],
        savingThrows: ['WIS', 'CHA'],
        features: ['Divine Domain', 'Channel Divinity'],
        equipment: ['Mace', 'Shield', "Explorer's Pack"],
      },
      Druid: {
        hitDie: 'd8',
        primaryAbilities: ['WIS'],
        savingThrows: ['INT', 'WIS'],
        features: ['Wild Shape', 'Druidic'],
        equipment: ['Scimitar', "Explorer's Pack"],
      },
      Fighter: {
        hitDie: 'd10',
        primaryAbilities: ['STR', 'DEX'],
        savingThrows: ['STR', 'CON'],
        features: ['Fighting Style', 'Second Wind'],
        equipment: ['Longsword', 'Shield', "Explorer's Pack"],
      },
      Monk: {
        hitDie: 'd8',
        primaryAbilities: ['DEX', 'WIS'],
        savingThrows: ['STR', 'DEX'],
        features: ['Unarmored Defense', 'Martial Arts'],
        equipment: ['Shortsword', "Explorer's Pack"],
      },
      Paladin: {
        hitDie: 'd10',
        primaryAbilities: ['STR', 'CHA'],
        savingThrows: ['WIS', 'CHA'],
        features: ['Divine Sense', 'Lay on Hands'],
        equipment: ['Longsword', 'Shield', "Explorer's Pack"],
      },
      Ranger: {
        hitDie: 'd10',
        primaryAbilities: ['STR', 'DEX', 'WIS'],
        savingThrows: ['STR', 'DEX'],
        features: ['Favored Enemy', 'Natural Explorer'],
        equipment: ['Longbow', 'Shortsword', "Explorer's Pack"],
      },
      Rogue: {
        hitDie: 'd8',
        primaryAbilities: ['DEX'],
        savingThrows: ['DEX', 'INT'],
        features: ['Sneak Attack', "Thieves' Cant"],
        equipment: ['Rapier', 'Shortbow', "Thieves' Tools"],
      },
      Sorcerer: {
        hitDie: 'd6',
        primaryAbilities: ['CHA'],
        savingThrows: ['CON', 'CHA'],
        features: ['Sorcerous Origin', 'Metamagic'],
        equipment: ['Dagger', 'Component Pouch', "Explorer's Pack"],
      },
      Warlock: {
        hitDie: 'd8',
        primaryAbilities: ['CHA'],
        savingThrows: ['WIS', 'CHA'],
        features: ['Otherworldly Patron', 'Pact Magic'],
        equipment: ['Dagger', 'Component Pouch', "Explorer's Pack"],
      },
      Wizard: {
        hitDie: 'd6',
        primaryAbilities: ['INT'],
        savingThrows: ['INT', 'WIS'],
        features: ['Arcane Recovery', 'Spellcasting'],
        equipment: ['Quarterstaff', 'Component Pouch', "Explorer's Pack"],
      },
    };

    const info = classData[className as keyof typeof classData];
    const proficiencyBonus = getProficiencyBonus(level);

    return {
      className,
      level,
      hitDie: info.hitDie,
      primaryAbilities: info.primaryAbilities,
      savingThrows: info.savingThrows,
      features: info.features,
      equipment: info.equipment,
      proficiencyBonus,
      hpAtFirstLevel: parseInt(info.hitDie.substring(1)) + getAbilityModifier(10), // Assuming average CON
    };
  },
});

/**
 * Tool to calculate D&D skill checks
 */
export const calculateSkillCheck = tool({
  description: 'Calculate a D&D skill check with ability modifier, proficiency bonus, and roll result',
  inputSchema: z.object({
    skill: z.enum(Object.keys(DND_SKILLS) as [keyof typeof DND_SKILLS]).describe('The skill to check'),
    abilityScore: z.number().min(1).max(20).describe('The ability score for the associated ability'),
    level: z.number().min(1).max(20).describe('Character level for proficiency bonus'),
    proficient: z.boolean().optional().describe('Whether the character is proficient in this skill'),
    expertise: z.boolean().optional().describe('Whether the character has expertise (double proficiency)'),
    advantage: z.boolean().optional().describe('Whether the roll has advantage'),
    disadvantage: z.boolean().optional().describe('Whether the roll has disadvantage'),
  }),
  execute: async ({
    skill,
    abilityScore,
    level,
    proficient = false,
    expertise = false,
    advantage = false,
    disadvantage = false,
  }) => {
    const ability = DND_SKILLS[skill];
    const abilityMod = getAbilityModifier(abilityScore);
    const proficiencyBonus = getProficiencyBonus(level);

    let skillBonus = abilityMod;
    if (expertise) {
      skillBonus += proficiencyBonus * 2;
    } else if (proficient) {
      skillBonus += proficiencyBonus;
    }

    // Roll with advantage/disadvantage
    const roll1 = rollDice('1d20');
    const roll2 = rollDice('1d20');
    let finalRoll;

    if (advantage && !disadvantage) {
      finalRoll = Math.max(roll1, roll2);
    } else if (disadvantage && !advantage) {
      finalRoll = Math.min(roll1, roll2);
    } else {
      finalRoll = roll1;
    }

    const total = finalRoll + skillBonus;
    const isCritical = finalRoll === 20;
    const isFumble = finalRoll === 1;

    return {
      skill,
      ability,
      abilityScore,
      abilityMod,
      proficiencyBonus,
      skillBonus,
      rolls: advantage || disadvantage ? [roll1, roll2] : [roll1],
      finalRoll,
      total,
      isCritical,
      isFumble,
      hasAdvantage: advantage && !disadvantage,
      hasDisadvantage: disadvantage && !advantage,
    };
  },
});

/**
 * Tool to generate D&D character
 */
export const generateDndCharacter = tool({
  description: 'Generate a random D&D 5th Edition character with race, class, ability scores, and basic equipment',
  inputSchema: z.object({
    level: z.number().min(1).max(20).optional().describe('Character level (default: 1)'),
    className: z.enum(DND_CLASSES).optional().describe('Specific class to generate (random if not specified)'),
    race: z.enum(DND_RACES).optional().describe('Specific race to generate (random if not specified)'),
    name: z.string().optional().describe('Character name (random if not specified)'),
  }),
  execute: async ({ level = 1, className, race, name }) => {
    // Generate random selections if not specified
    const selectedClass = className || DND_CLASSES[Math.floor(Math.random() * DND_CLASSES.length)];
    const selectedRace = race || DND_RACES[Math.floor(Math.random() * DND_RACES.length)];

    // Generate ability scores using standard array (15, 14, 13, 12, 10, 8)
    const scores = [15, 14, 13, 12, 10, 8];
    const shuffledScores = scores.sort(() => Math.random() - 0.5);

    const abilities = {
      STR: shuffledScores[0],
      DEX: shuffledScores[1],
      CON: shuffledScores[2],
      INT: shuffledScores[3],
      WIS: shuffledScores[4],
      CHA: shuffledScores[5],
    };

    // Generate random name if not provided
    const firstNames = ['Aria', 'Bram', 'Cora', 'Dax', 'Elara', 'Finn', 'Gwen', 'Hugo', 'Iris', 'Jax'];
    const lastNames = ['Blackwood', 'Ironforge', 'Moonwhisper', 'Stormwind', 'Thorn', 'Swift'];
    const generatedName =
      name ||
      `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    // Calculate HP
    const classData = {
      Barbarian: {
        hitDie: 'd12',
        equipment: ['Greataxe', 'Handaxe', "Explorer's Pack"],
        features: ['Rage', 'Unarmored Defense'],
      },
      Bard: {
        hitDie: 'd8',
        equipment: ['Rapier', 'Lute', "Explorer's Pack"],
        features: ['Bardic Inspiration', 'Jack of All Trades'],
      },
      Cleric: {
        hitDie: 'd8',
        equipment: ['Mace', 'Shield', "Explorer's Pack"],
        features: ['Divine Domain', 'Channel Divinity'],
      },
      Druid: { hitDie: 'd8', equipment: ['Scimitar', "Explorer's Pack"], features: ['Wild Shape', 'Druidic'] },
      Fighter: {
        hitDie: 'd10',
        equipment: ['Longsword', 'Shield', "Explorer's Pack"],
        features: ['Fighting Style', 'Second Wind'],
      },
      Monk: { hitDie: 'd8', equipment: ['Shortsword', "Explorer's Pack"], features: ['Unarmored Defense', 'Martial Arts'] },
      Paladin: {
        hitDie: 'd10',
        equipment: ['Longsword', 'Shield', "Explorer's Pack"],
        features: ['Divine Sense', 'Lay on Hands'],
      },
      Ranger: {
        hitDie: 'd10',
        equipment: ['Longbow', 'Shortsword', "Explorer's Pack"],
        features: ['Favored Enemy', 'Natural Explorer'],
      },
      Rogue: {
        hitDie: 'd8',
        equipment: ['Rapier', 'Shortbow', "Thieves' Tools"],
        features: ['Sneak Attack', "Thieves' Cant"],
      },
      Sorcerer: {
        hitDie: 'd6',
        equipment: ['Dagger', 'Component Pouch', "Explorer's Pack"],
        features: ['Sorcerous Origin', 'Metamagic'],
      },
      Warlock: {
        hitDie: 'd8',
        equipment: ['Dagger', 'Component Pouch', "Explorer's Pack"],
        features: ['Otherworldly Patron', 'Pact Magic'],
      },
      Wizard: {
        hitDie: 'd6',
        equipment: ['Quarterstaff', 'Component Pouch', "Explorer's Pack"],
        features: ['Arcane Recovery', 'Spellcasting'],
      },
    };
    const classInfo = classData[selectedClass as keyof typeof classData];
    const conMod = getAbilityModifier(abilities.CON);
    const hp =
      parseInt(classInfo.hitDie.substring(1)) +
      conMod +
      (level - 1) * (parseInt(classInfo.hitDie.substring(1)) / 2 + conMod);

    return {
      name: generatedName,
      race: selectedRace,
      class: selectedClass,
      level,
      abilities,
      abilityModifiers: Object.fromEntries(
        Object.entries(abilities).map(([key, value]) => [key, getAbilityModifier(value)]),
      ),
      hp: Math.floor(hp),
      proficiencyBonus: getProficiencyBonus(level),
      equipment: classInfo.equipment,
      features: classInfo.features,
    };
  },
});

/**
 * Tool to get D&D spell information
 */
export const getSpellInfo = tool({
  description: 'Get information about D&D 5th Edition spells by name, level, or school',
  inputSchema: z.object({
    spellName: z.string().optional().describe('Specific spell name to look up'),
    level: z.number().min(0).max(9).optional().describe('Spell level to filter by (0-9)'),
    school: z.enum(SPELL_SCHOOLS).optional().describe('Spell school to filter by'),
    className: z.enum(DND_CLASSES).optional().describe('Class to get spell list for'),
  }),
  execute: async ({ spellName, level, school, className }) => {
    // Basic spell database (in a real implementation, this would come from a comprehensive database)
    const spells = [
      {
        name: 'Fireball',
        level: 3,
        school: 'Evocation',
        classes: ['Wizard', 'Sorcerer'],
        description: 'A fiery explosion deals 8d6 fire damage.',
      },
      {
        name: 'Cure Wounds',
        level: 1,
        school: 'Evocation',
        classes: ['Cleric', 'Druid', 'Paladin', 'Ranger'],
        description: 'Heal 1d8 + spellcasting ability modifier damage.',
      },
      {
        name: 'Magic Missile',
        level: 1,
        school: 'Evocation',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Three darts of force deal 1d4+1 damage each.',
      },
      {
        name: 'Shield',
        level: 1,
        school: 'Abjuration',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Increase AC by 5 against one attack.',
      },
      {
        name: 'Invisibility',
        level: 2,
        school: 'Illusion',
        classes: ['Wizard', 'Sorcerer', 'Bard'],
        description: 'Become invisible until you attack or cast a spell.',
      },
      {
        name: 'Lightning Bolt',
        level: 3,
        school: 'Evocation',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Line of lightning deals 8d6 damage.',
      },
      {
        name: 'Teleport',
        level: 7,
        school: 'Conjuration',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Transport yourself and others instantly.',
      },
      {
        name: 'Detect Magic',
        level: 1,
        school: 'Divination',
        classes: ['Wizard', 'Cleric', 'Druid', 'Paladin'],
        description: 'Sense the presence of magic within 30 feet.',
      },
      {
        name: 'Mage Armor',
        level: 1,
        school: 'Abjuration',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Base AC becomes 13 + Dexterity modifier.',
      },
      {
        name: 'Haste',
        level: 3,
        school: 'Transmutation',
        classes: ['Wizard', 'Sorcerer'],
        description: 'Target gains extra action and speed.',
      },
    ];

    let filteredSpells = spells;

    if (spellName) {
      filteredSpells = spells.filter((spell) => spell.name.toLowerCase().includes(spellName!.toLowerCase()));
    }

    if (level !== undefined) {
      filteredSpells = filteredSpells.filter((spell) => spell.level === level);
    }

    if (school) {
      filteredSpells = filteredSpells.filter((spell) => spell.school === school);
    }

    if (className) {
      filteredSpells = filteredSpells.filter((spell) => spell.classes.includes(className));
    }

    return {
      spells: filteredSpells,
      count: filteredSpells.length,
      filters: { spellName, level, school, className },
    };
  },
});

/**
 * Tool to simulate D&D combat encounter
 */
export const simulateCombatEncounter = tool({
  description: 'Simulate a D&D combat encounter between characters and monsters',
  inputSchema: z.object({
    partyLevel: z.number().min(1).max(20).describe('Average party level'),
    partySize: z.number().min(1).max(8).describe('Number of player characters'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Deadly']).describe('Encounter difficulty'),
    monsterTypes: z.array(z.string()).optional().describe('Specific monster types to include'),
    terrain: z.string().optional().describe('Terrain type for the encounter'),
  }),
  execute: async ({ partyLevel, partySize, difficulty, monsterTypes = [], terrain = 'Open field' }) => {
    // Calculate encounter XP budget based on DMG guidelines
    const xpThresholds = {
      Easy: { 1: 25, 2: 50, 3: 75, 4: 125, 5: 250 },
      Medium: { 1: 50, 2: 100, 3: 150, 4: 250, 5: 500 },
      Hard: { 1: 75, 2: 150, 3: 225, 4: 375, 5: 750 },
      Deadly: { 1: 100, 2: 200, 3: 400, 4: 500, 5: 1100 },
    };

    const baseXP = (xpThresholds[difficulty] as any)[Math.min(partyLevel, 5)] || 100;
    const totalXPBudget = baseXP * partySize;

    // Simple monster database
    const monsters = [
      { name: 'Goblin', cr: 0.25, hp: 7, ac: 15, attack: '+4', damage: '1d6+2', xp: 50 },
      { name: 'Orc', cr: 0.5, hp: 15, ac: 13, attack: '+5', damage: '1d8+3', xp: 100 },
      { name: 'Bandit', cr: 0.125, hp: 11, ac: 12, attack: '+3', damage: '1d6+1', xp: 25 },
      { name: 'Wolf', cr: 0.25, hp: 11, ac: 13, attack: '+3', damage: '1d6+1', xp: 50 },
      { name: 'Skeleton', cr: 0.25, hp: 13, ac: 13, attack: '+4', damage: '1d6+2', xp: 50 },
      { name: 'Zombie', cr: 0.25, hp: 22, ac: 8, attack: '+3', damage: '1d6+1', xp: 50 },
    ];

    let selectedMonsters = monsters;
    if (monsterTypes.length > 0) {
      selectedMonsters = monsters.filter((m) =>
        monsterTypes.some((type) => m.name.toLowerCase().includes(type.toLowerCase())),
      );
    }

    // Build encounter within XP budget
    const encounter = [];
    let remainingXP = totalXPBudget;

    while (remainingXP > 0) {
      const affordableMonsters = selectedMonsters.filter((m) => m.xp <= remainingXP);
      if (affordableMonsters.length === 0) break;

      const monster = affordableMonsters[Math.floor(Math.random() * affordableMonsters.length)];
      encounter.push({ ...monster, id: encounter.length + 1 });
      remainingXP -= monster.xp;
    }

    // Calculate initiative order
    const initiativeOrder = encounter
      .map((monster) => ({
        ...monster,
        initiative: rollDice('1d20') + (monster.name === 'Wolf' ? 2 : 0), // Wolves have +2 DEX
      }))
      .sort((a, b) => b.initiative - a.initiative);

    return {
      encounter: {
        partyLevel,
        partySize,
        difficulty,
        terrain,
        xpBudget: totalXPBudget,
        actualXP: encounter.reduce((sum, m) => sum + m.xp, 0),
        monsters: encounter,
        initiativeOrder,
        description: `${encounter.length} ${encounter.map((m) => m.name).join(', ')} appear in the ${terrain}!`,
      },
    };
  },
});

/**
 * Tool to roll dice with various D&D notations
 */
export const rollDiceTool = tool({
  description: 'Roll dice using D&D notation (e.g., 2d6+3, 1d20, 4d8) with optional modifiers',
  inputSchema: z.object({
    notation: z.string().describe('Dice notation in format like "2d6+3", "1d20", "4d8"'),
    count: z.number().min(1).max(10).optional().describe('Number of times to roll (default: 1)'),
    description: z.string().optional().describe('Description of what the roll is for'),
  }),
  execute: async ({ notation, count = 1, description }) => {
    const result = rollDice(notation);

    // If only rolling once, return simple result
    if (count === 1) {
      return {
        notation,
        count,
        description,
        roll: result,
      };
    }

    // For multiple rolls, return array
    const rolls = [];
    let totalSum = 0;

    for (let i = 0; i < count; i++) {
      const rollResult = rollDice(notation);
      rolls.push(rollResult);
      totalSum += rollResult;
    }

    return {
      notation,
      count,
      description,
      rolls,
      totalSum,
      average: totalSum / count,
      min: Math.min(...rolls),
      max: Math.max(...rolls),
    };
  },
});

export const dndTools = {
  getDndClassInfo,
  simulateCombatEncounter,
  rollDice: rollDiceTool,
  generateDndCharacter,
  getSpellInfo,
  calculateSkillCheck,
} as const;

/**
 * System prompt fragment for teaching AI about D&D tools
 */
export const DND_TOOLS_PROMPT = `You have access to Dungeons & Dragons 5th Edition tools to help players and Dungeon Masters. Use these tools to provide accurate D&D information and perform game mechanics.

## Available D&D Tools:

### 1. getDndClassInfo
**Purpose**: Get detailed information about D&D 5th Edition classes
**When to use**: When players ask about class features, abilities, or want to compare classes
**Parameters**: 
- className (required): One of [Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard]
- level (optional): Character level for level-specific features (1-20)

**Example Usage**: 
- "Tell me about Fighter class features"
- "What does a Level 5 Wizard get?"
- "Compare Barbarian and Paladin"

### 2. calculateSkillCheck
**Purpose**: Calculate D&D skill checks with proper modifiers and dice rolls
**When to use**: When players need to make skill checks, ability checks, or want to know their chances
**Parameters**:
- skill (required): Skill name [Athletics, Acrobatics, Sleight_of_Hand, Stealth, Arcana, History, Investigation, Nature, Religion, Animal_Handling, Insight, Medicine, Perception, Survival, Deception, Intimidation, Performance, Persuasion]
- abilityScore (required): The ability score for the associated ability (1-20)
- level (required): Character level for proficiency bonus (1-20)
- proficient (optional): Whether character is proficient in this skill
- expertise (optional): Whether character has expertise (double proficiency)
- advantage (optional): Whether roll has advantage
- disadvantage (optional): Whether roll has disadvantage

**Example Usage**:
- "I want to make a Perception check, my Wisdom is 16, I'm level 5 and proficient"
- "Roll a Stealth check with advantage, DEX 14, level 3 rogue"
- "What's my bonus for Arcana with INT 18, level 7, proficient?"

### 3. generateDndCharacter
**Purpose**: Generate random D&D characters with complete stats
**When to use**: When players need new characters, NPCs, or want character ideas
**Parameters**:
- level (optional): Character level (default: 1)
- className (optional): Specific class to generate
- race (optional): Specific race to generate [Human, Elf, Dwarf, Halfling, Gnome, Dragonborn, Tiefling, Half-Elf, Half-Orc]
- name (optional): Character name

**Example Usage**:
- "Generate a random level 3 character"
- "Create a Dwarf Fighter named Thorin"
- "I need a new character, level 5 Elf"

### 4. getSpellInfo
**Purpose**: Look up D&D spell information
**When to use**: When players ask about spells, want spell lists, or need spell details
**Parameters**:
- spellName (optional): Specific spell name to search
- level (optional): Filter by spell level (0-9, where 0 = cantrips)
- school (optional): Filter by school [Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation]
- className (optional): Get spells available to specific class

**Example Usage**:
- "Tell me about Fireball spell"
- "What level 2 Evocation spells are there?"
- "Show me Wizard cantrips"
- "Find healing spells for Cleric"

### 5. simulateCombatEncounter
**Purpose**: Create balanced combat encounters for parties
**When to use**: When DMs need encounter ideas, want balanced fights, or encounter suggestions
**Parameters**:
- partyLevel (required): Average party level (1-20)
- partySize (required): Number of player characters (1-8)
- difficulty (required): Encounter difficulty [Easy, Medium, Hard, Deadly]
- monsterTypes (optional): Specific monster types to include
- terrain (optional): Terrain type for encounter

**Example Usage**:
- "Create a Medium encounter for 4 level 3 players"
- "I need a Hard encounter with goblins for level 2 party of 3"
- "Deadly encounter in a forest for level 5 party of 5"

### 6. rollDiceTool
**Purpose**: Roll dice using standard D&D notation
**When to use**: For any dice rolls, damage rolls, or randomization needs
**Parameters**:
- notation (required): Dice notation like "2d6+3", "1d20", "4d8"
- count (optional): Number of times to roll (default: 1)
- description (optional): What the roll is for

**Example Usage**:
- "Roll 2d6+3 for greatsword damage"
- "Roll a d20 for attack"
- "Roll 4d6 and drop lowest for stats"

## Best Practices:

1. **Always use tools for D&D mechanics** - Don't guess rules or make up calculations
2. **Ask for missing required parameters** - If a player doesn't provide needed info, ask them
3. **Explain results clearly** - Break down what dice rolls mean and modifiers applied
4. **Use appropriate difficulty levels** - For encounters, consider party capabilities
5. **Provide context** - Explain why certain bonuses apply or what features mean
6. **Be creative but accurate** - Use tools for mechanics, add flavor and storytelling

## Common Scenarios:

- **Character Creation**: Use generateDndCharacter + getDndClassInfo
- **Combat**: Use calculateSkillCheck for attacks/saves, rollDiceTool for damage, simulateCombatEncounter for planning
- **Exploration**: Use calculateSkillCheck for perception/stealth, getSpellInfo for utility spells
- **Social**: Use calculateSkillCheck for persuasion/deception/intimidation
- **Leveling Up**: Use getDndClassInfo with new level, recalculate HP and abilities

Remember: You are a D&D assistant. Use these tools to provide accurate, helpful information while maintaining the spirit of the game. Encourage creativity while ensuring rules are followed correctly.`;
