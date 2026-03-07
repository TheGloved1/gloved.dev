import { tool } from 'ai';
import { z } from 'zod';

// D&D 5e API base URL
const DND_API_BASE = 'https://www.dnd5eapi.co';

// TypeScript types for D&D 5e API responses
interface APIReference {
  index: string;
  name: string;
  url: string;
}

interface APIChoice {
  desc: string;
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options: any[];
  };
}

interface ClassLevel {
  level: number;
  ability_score_bonuses: number;
  prof_bonus: number;
  features: APIReference[];
  class_specific: Record<string, any>;
  index: string;
  class: APIReference;
  url: string;
  updated_at: string;
}

interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: APIChoice[];
  proficiencies: APIReference[];
  saving_throws: APIReference[];
  starting_equipment: any[];
  starting_equipment_options: APIChoice[];
  class_levels: string;
  multi_classing: {
    prerequisite_options: any;
    proficiencies: APIReference[];
  };
  subclasses: APIReference[];
  url: string;
  updated_at: string;
}

interface Spell {
  index: string;
  name: string;
  desc: string[];
  higher_level: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  damage?: {
    damage_type: APIReference;
    damage_at_slot_level: Record<string, string>;
  };
  dc?: {
    dc_type: APIReference;
    dc_success: string;
  };
  area_of_effect?: {
    type: string;
    size: number;
  };
  school: APIReference;
  classes: APIReference[];
  subclasses: APIReference[];
  url: string;
  updated_at: string;
}

interface Feature {
  index: string;
  name: string;
  desc: string[];
  url: string;
  updated_at: string;
}

const DND_API_ROOT_RESPONSE = {
  'ability-scores': '/api/2014/ability-scores',
  alignments: '/api/2014/alignments',
  backgrounds: '/api/2014/backgrounds',
  classes: '/api/2014/classes',
  conditions: '/api/2014/conditions',
  'damage-types': '/api/2014/damage-types',
  equipment: '/api/2014/equipment',
  'equipment-categories': '/api/2014/equipment-categories',
  feats: '/api/2014/feats',
  features: '/api/2014/features',
  languages: '/api/2014/languages',
  'magic-items': '/api/2014/magic-items',
  'magic-schools': '/api/2014/magic-schools',
  monsters: '/api/2014/monsters',
  proficiencies: '/api/2014/proficiencies',
  races: '/api/2014/races',
  'rule-sections': '/api/2014/rule-sections',
  rules: '/api/2014/rules',
  skills: '/api/2014/skills',
  spells: '/api/2014/spells',
  subclasses: '/api/2014/subclasses',
  subraces: '/api/2014/subraces',
  traits: '/api/2014/traits',
  'weapon-properties': '/api/2014/weapon-properties',
};

// Simple cache for API responses
const apiCache = new Map<string, any>();

/**
 * Fetch data from D&D 5e API with caching and type safety
 */
async function fetchFromApi<T = any>(endpoint: string): Promise<T> {
  const cacheKey = `${DND_API_BASE}${endpoint}`;

  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    const response = await fetch(cacheKey);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as T;
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from D&D API: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Tool to get D&D spell information
 */
export const getSpellInfo = tool({
  description:
    'Get detailed information about a D&D 5th Edition spell including description, casting time, range, components, and duration',
  inputSchema: z.object({
    spellName: z.string().describe('The name of the spell to look up'),
    level: z.number().min(0).max(9).optional().describe('Filter spells by level (0-9)'),
    school: z.string().optional().describe('Filter spells by school of magic'),
  }),
  execute: async ({ spellName, level, school }) => {
    try {
      // If searching for a specific spell by name
      if (spellName && !level && !school) {
        const spellData = await fetchFromApi<Spell>(`/api/2014/spells/${spellName.toLowerCase().replace(/\s+/g, '-')}`);
        return {
          name: spellData.name,
          level: spellData.level,
          school: spellData.school?.name,
          castingTime: spellData.casting_time,
          range: spellData.range,
          components: spellData.components,
          duration: spellData.duration,
          description: spellData.desc,
          higherLevel: spellData.higher_level,
          classes: spellData.classes?.map((cls) => cls.name) || [],
          url: spellData.url,
        };
      }

      // Otherwise, search spells with filters
      let searchEndpoint = '/api/2014/spells';
      const params = new URLSearchParams();

      if (level !== undefined) params.append('level', level.toString());
      if (school) params.append('school', school);
      if (spellName) params.append('name', spellName);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      const spellsData = await fetchFromApi(searchEndpoint);
      const spells = Array.isArray(spellsData) ? spellsData : spellsData.results || [];

      // Fetch detailed information for each spell (limited to first 10 for performance)
      const detailedSpells = await Promise.all(
        spells
          .slice(0, 10)
          .map((spell: any) =>
            fetchFromApi<Spell>(`/api/2014/spells/${spell.index || spell.name.toLowerCase().replace(/\s+/g, '-')}`),
          ),
      );

      return {
        count: spells.length,
        spells: detailedSpells.map((spell) => ({
          name: spell.name,
          level: spell.level,
          school: spell.school?.name,
          castingTime: spell.casting_time,
          range: spell.range,
          components: spell.components,
          duration: spell.duration,
          description: spell.desc?.[0] || spell.desc,
          classes: spell.classes?.map((cls: APIReference) => cls.name) || [],
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch spell information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// API endpoint tools for general resource access
export const getAbilityScores = tool({
  description: 'Get information about D&D ability scores (STR, DEX, CON, INT, WIS, CHA)',
  inputSchema: z.object({
    score: z.string().optional().describe('Specific ability score to get (str, dex, con, int, wis, cha)'),
  }),
  execute: async ({ score }) => {
    try {
      if (score) {
        return await fetchFromApi(`/api/2014/ability-scores/${score.toLowerCase()}`);
      }
      return await fetchFromApi('/api/2014/ability-scores');
    } catch (error) {
      throw new Error(`Failed to fetch ability scores: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getAlignments = tool({
  description: 'Get information about D&D alignments (Lawful Good, Chaotic Evil, etc.)',
  inputSchema: z.object({
    alignment: z.string().optional().describe('Specific alignment to get'),
  }),
  execute: async ({ alignment }) => {
    try {
      if (alignment) {
        return await fetchFromApi(`/api/2014/alignments/${alignment.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/alignments');
    } catch (error) {
      throw new Error(`Failed to fetch alignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getBackgrounds = tool({
  description: 'Get information about D&D character backgrounds',
  inputSchema: z.object({
    background: z.string().optional().describe('Specific background to get'),
  }),
  execute: async ({ background }) => {
    try {
      if (background) {
        return await fetchFromApi(`/api/2014/backgrounds/${background.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/backgrounds');
    } catch (error) {
      throw new Error(`Failed to fetch backgrounds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getConditions = tool({
  description: 'Get information about D&D conditions (blinded, charmed, frightened, etc.)',
  inputSchema: z.object({
    condition: z.string().optional().describe('Specific condition to get'),
  }),
  execute: async ({ condition }) => {
    try {
      if (condition) {
        return await fetchFromApi(`/api/2014/conditions/${condition.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/conditions');
    } catch (error) {
      throw new Error(`Failed to fetch conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getDamageTypes = tool({
  description: 'Get information about D&D damage types (fire, cold, lightning, etc.)',
  inputSchema: z.object({
    damageType: z.string().optional().describe('Specific damage type to get'),
  }),
  execute: async ({ damageType }) => {
    try {
      if (damageType) {
        return await fetchFromApi(`/api/2014/damage-types/${damageType.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/damage-types');
    } catch (error) {
      throw new Error(`Failed to fetch damage types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getEquipment = tool({
  description: 'Get information about D&D equipment, weapons, armor, and items',
  inputSchema: z.object({
    equipment: z.string().optional().describe('Specific equipment to get'),
  }),
  execute: async ({ equipment }) => {
    try {
      if (equipment) {
        return await fetchFromApi(`/api/2014/equipment/${equipment.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/equipment');
    } catch (error) {
      throw new Error(`Failed to fetch equipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getEquipmentCategories = tool({
  description: 'Get information about D&D equipment categories (weapons, armor, tools, etc.)',
  inputSchema: z.object({
    category: z.string().optional().describe('Specific equipment category to get'),
  }),
  execute: async ({ category }) => {
    try {
      if (category) {
        return await fetchFromApi(`/api/2014/equipment-categories/${category.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/equipment-categories');
    } catch (error) {
      throw new Error(`Failed to fetch equipment categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getFeats = tool({
  description: 'Get information about D&D feats',
  inputSchema: z.object({
    feat: z.string().optional().describe('Specific feat to get'),
  }),
  execute: async ({ feat }) => {
    try {
      if (feat) {
        return await fetchFromApi(`/api/2014/feats/${feat.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/feats');
    } catch (error) {
      throw new Error(`Failed to fetch feats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getFeatures = tool({
  description: 'Get information about D&D class features',
  inputSchema: z.object({
    feature: z.string().optional().describe('Specific feature to get'),
  }),
  execute: async ({ feature }) => {
    try {
      if (feature) {
        return await fetchFromApi(`/api/2014/features/${feature.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/features');
    } catch (error) {
      throw new Error(`Failed to fetch features: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getLanguages = tool({
  description: 'Get information about D&D languages',
  inputSchema: z.object({
    language: z.string().optional().describe('Specific language to get'),
  }),
  execute: async ({ language }) => {
    try {
      if (language) {
        return await fetchFromApi(`/api/2014/languages/${language.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/languages');
    } catch (error) {
      throw new Error(`Failed to fetch languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getMagicItems = tool({
  description: 'Get information about D&D magic items',
  inputSchema: z.object({
    item: z.string().optional().describe('Specific magic item to get'),
  }),
  execute: async ({ item }) => {
    try {
      if (item) {
        return await fetchFromApi(`/api/2014/magic-items/${item.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/magic-items');
    } catch (error) {
      throw new Error(`Failed to fetch magic items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getMagicSchools = tool({
  description: 'Get information about D&D schools of magic',
  inputSchema: z.object({
    school: z.string().optional().describe('Specific magic school to get'),
  }),
  execute: async ({ school }) => {
    try {
      if (school) {
        return await fetchFromApi(`/api/2014/magic-schools/${school.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/magic-schools');
    } catch (error) {
      throw new Error(`Failed to fetch magic schools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getMonsters = tool({
  description: 'Get information about D&D monsters',
  inputSchema: z.object({
    monster: z.string().optional().describe('Specific monster to get'),
    challenge: z.number().optional().describe('Filter by challenge rating'),
    type: z.string().optional().describe('Filter by monster type'),
  }),
  execute: async ({ monster, challenge, type }) => {
    try {
      if (monster) {
        return await fetchFromApi(`/api/2014/monsters/${monster.toLowerCase().replace(/\s+/g, '-')}`);
      }

      let searchEndpoint = '/api/2014/monsters';
      const params = new URLSearchParams();

      if (challenge !== undefined) params.append('challenge_rating', challenge.toString());
      if (type) params.append('type', type);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      return await fetchFromApi(searchEndpoint);
    } catch (error) {
      throw new Error(`Failed to fetch monsters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getProficiencies = tool({
  description: 'Get information about D&D proficiencies',
  inputSchema: z.object({
    proficiency: z.string().optional().describe('Specific proficiency to get'),
    type: z.string().optional().describe('Filter by proficiency type'),
  }),
  execute: async ({ proficiency, type }) => {
    try {
      if (proficiency) {
        return await fetchFromApi(`/api/2014/proficiencies/${proficiency.toLowerCase().replace(/\s+/g, '-')}`);
      }

      let searchEndpoint = '/api/2014/proficiencies';
      const params = new URLSearchParams();

      if (type) params.append('type', type);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      return await fetchFromApi(searchEndpoint);
    } catch (error) {
      throw new Error(`Failed to fetch proficiencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getRaces = tool({
  description: 'Get information about D&D races',
  inputSchema: z.object({
    race: z.string().optional().describe('Specific race to get'),
  }),
  execute: async ({ race }) => {
    try {
      if (race) {
        return await fetchFromApi(`/api/2014/races/${race.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/races');
    } catch (error) {
      throw new Error(`Failed to fetch races: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getSkills = tool({
  description: 'Get information about D&D skills',
  inputSchema: z.object({
    skill: z.string().optional().describe('Specific skill to get'),
  }),
  execute: async ({ skill }) => {
    try {
      if (skill) {
        return await fetchFromApi(`/api/2014/skills/${skill.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/skills');
    } catch (error) {
      throw new Error(`Failed to fetch skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getSubclasses = tool({
  description: 'Get information about D&D subclasses',
  inputSchema: z.object({
    subclass: z.string().optional().describe('Specific subclass to get'),
    class: z.string().optional().describe('Filter by parent class'),
  }),
  execute: async ({ subclass, class: parentClass }) => {
    try {
      if (subclass) {
        return await fetchFromApi(`/api/2014/subclasses/${subclass.toLowerCase().replace(/\s+/g, '-')}`);
      }

      let searchEndpoint = '/api/2014/subclasses';
      const params = new URLSearchParams();

      if (parentClass) params.append('class', parentClass);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      return await fetchFromApi(searchEndpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subclasses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getSubraces = tool({
  description: 'Get information about D&D subraces',
  inputSchema: z.object({
    subrace: z.string().optional().describe('Specific subrace to get'),
    race: z.string().optional().describe('Filter by parent race'),
  }),
  execute: async ({ subrace, race }) => {
    try {
      if (subrace) {
        return await fetchFromApi(`/api/2014/subraces/${subrace.toLowerCase().replace(/\s+/g, '-')}`);
      }

      let searchEndpoint = '/api/2014/subraces';
      const params = new URLSearchParams();

      if (race) params.append('race', race);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      return await fetchFromApi(searchEndpoint);
    } catch (error) {
      throw new Error(`Failed to fetch subraces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getTraits = tool({
  description: 'Get information about D&D racial traits',
  inputSchema: z.object({
    trait: z.string().optional().describe('Specific trait to get'),
    race: z.string().optional().describe('Filter by race'),
  }),
  execute: async ({ trait, race }) => {
    try {
      if (trait) {
        return await fetchFromApi(`/api/2014/traits/${trait.toLowerCase().replace(/\s+/g, '-')}`);
      }

      let searchEndpoint = '/api/2014/traits';
      const params = new URLSearchParams();

      if (race) params.append('race', race);

      if (params.toString()) {
        searchEndpoint += `?${params.toString()}`;
      }

      return await fetchFromApi(searchEndpoint);
    } catch (error) {
      throw new Error(`Failed to fetch traits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getWeaponProperties = tool({
  description: 'Get information about D&D weapon properties',
  inputSchema: z.object({
    property: z.string().optional().describe('Specific weapon property to get'),
  }),
  execute: async ({ property }) => {
    try {
      if (property) {
        return await fetchFromApi(`/api/2014/weapon-properties/${property.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/weapon-properties');
    } catch (error) {
      throw new Error(`Failed to fetch weapon properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getRules = tool({
  description: 'Get information about D&D rules and rule sections',
  inputSchema: z.object({
    rule: z.string().optional().describe('Specific rule to get'),
    section: z.string().optional().describe('Specific rule section to get'),
  }),
  execute: async ({ rule, section }) => {
    try {
      if (rule) {
        return await fetchFromApi(`/api/2014/rules/${rule.toLowerCase().replace(/\s+/g, '-')}`);
      }
      if (section) {
        return await fetchFromApi(`/api/2014/rule-sections/${section.toLowerCase().replace(/\s+/g, '-')}`);
      }
      return await fetchFromApi('/api/2014/rules');
    } catch (error) {
      throw new Error(`Failed to fetch rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// General API endpoint tool for any endpoint
export const getApiResource = tool({
  description:
    "Get any D&D API resource by endpoint. Use this for exploring the API or when other tools don't cover a specific need.",
  inputSchema: z.object({
    endpoint: z.string().describe('API endpoint (e.g., "classes", "spells", "monsters")'),
    index: z.string().optional().describe('Specific resource index (optional)'),
    subPath: z.string().optional().describe('Additional sub-path (e.g., "levels", "features", "spells")'),
  }),
  execute: async ({ endpoint, index, subPath }) => {
    try {
      let path = `/api/2014/${endpoint}`;
      if (index) {
        path += `/${index}`;
      }
      if (subPath) {
        path += `/${subPath}`;
      }
      return await fetchFromApi(path);
    } catch (error) {
      throw new Error(`Failed to fetch API resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

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
  if (!match) throw new Error(`Invalid dice notation: ${notation}. Expected format like "2d6+3" or "1d20"`);

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
    try {
      // Fetch class data from API with proper typing
      const classData = await fetchFromApi<DndClass>(`/api/2014/classes/${className.toLowerCase()}`);

      // Fetch class levels for level-specific features
      const levelData = await fetchFromApi<ClassLevel[]>(`/api/2014/classes/${className.toLowerCase()}/levels`);

      // Get features for the specified level
      const levelFeatures = levelData
        .filter((levelInfo) => levelInfo.level <= level)
        .flatMap((levelInfo) => levelInfo.features || []);

      // Fetch detailed feature information
      const featuresPromises = levelFeatures.map((feature) => fetchFromApi<Feature>(`/api/2014/features/${feature.index}`));
      const featuresDetails = await Promise.all(featuresPromises);

      // Fetch starting equipment
      const equipmentData = await fetchFromApi(`/api/2014/classes/${className.toLowerCase()}/starting-equipment`);

      // Handle equipment data - it might be an object with different structure
      let equipment = [];
      if (Array.isArray(equipmentData)) {
        equipment = equipmentData.map((item: any) => item.equipment?.name || item.item?.name || item);
      } else if (equipmentData && typeof equipmentData === 'object') {
        // Handle case where API returns object with different structure
        if (equipmentData.starting_equipment && Array.isArray(equipmentData.starting_equipment)) {
          equipment = equipmentData.starting_equipment.map((item: any) => item.equipment?.name || item.item?.name || item);
        }
        // Fallback to some basic equipment if API structure is unexpected
        if (equipment.length === 0) {
          equipment = ['Basic Equipment'];
        }
      } else {
        equipment = ['Basic Equipment'];
      }

      const proficiencyBonus = getProficiencyBonus(level);

      return {
        className,
        level,
        hitDie: classData.hit_die,
        primaryAbilities: [], // API doesn't provide this directly, would need to be inferred
        savingThrows: classData.saving_throws?.map((save) => save.name) || [],
        features: featuresDetails.map((feature) => feature.name),
        equipment,
        proficiencyBonus,
        hpAtFirstLevel: classData.hit_die + getAbilityModifier(10), // Assuming average CON
        subclasses: classData.subclasses?.map((sub) => sub.name) || [],
        url: classData.url,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch class information for ${className}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
  description:
    'Generate a random D&D 5th Edition character with race, class, ability scores, and equipment. The AI should generate a creative name for the character.',
  inputSchema: z.object({
    name: z.string().describe('Character name - AI should generate a creative, fantasy-appropriate name'),
    level: z.number().min(1).max(20).optional().describe('Character level (default: 1)'),
    className: z.enum(DND_CLASSES).optional().describe('Specific class to generate (random if not specified)'),
    race: z.enum(DND_RACES).optional().describe('Specific race to generate (random if not specified)'),
  }),
  execute: async ({ name, level = 1, className, race }) => {
    try {
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

      // Use the AI-generated name
      const generatedName = name;

      // Get class information from API with proper typing
      const classData = await fetchFromApi<DndClass>(`/api/2014/classes/${selectedClass.toLowerCase()}`);
      const equipmentData = await fetchFromApi(`/api/2014/classes/${selectedClass.toLowerCase()}/starting-equipment`);
      const levelData = await fetchFromApi<ClassLevel[]>(`/api/2014/classes/${selectedClass.toLowerCase()}/levels`);

      // Get features for the specified level
      const levelFeatures = levelData
        .filter((levelInfo) => levelInfo.level <= level)
        .flatMap((levelInfo) => levelInfo.features || []);

      // Calculate HP
      const conMod = getAbilityModifier(abilities.CON);
      const hp = classData.hit_die + conMod + (level - 1) * (classData.hit_die / 2 + conMod);

      // Handle equipment data - it might be an object with different structure
      let equipment = [];
      if (Array.isArray(equipmentData)) {
        equipment = equipmentData.map((item: any) => item.equipment?.name || item.item?.name || item);
      } else if (equipmentData && typeof equipmentData === 'object') {
        // Handle case where API returns object with different structure
        if (equipmentData.starting_equipment && Array.isArray(equipmentData.starting_equipment)) {
          equipment = equipmentData.starting_equipment.map((item: any) => item.equipment?.name || item.item?.name || item);
        }
        // Fallback to some basic equipment if API structure is unexpected
        if (equipment.length === 0) {
          equipment = ['Basic Equipment'];
        }
      } else {
        equipment = ['Basic Equipment'];
      }

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
        equipment,
        features: levelFeatures.map((feature: any) => feature.name),
      };
    } catch (error) {
      throw new Error(`Failed to generate character: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    notation: z.string().describe('Dice notation in format like "2d6+3", "1d20", "4d8" (must follow D&D rules)'),
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
  // New API endpoint tools
  getAbilityScores,
  getAlignments,
  getBackgrounds,
  getConditions,
  getDamageTypes,
  getEquipment,
  getEquipmentCategories,
  getFeats,
  getFeatures,
  getLanguages,
  getMagicItems,
  getMagicSchools,
  getMonsters,
  getProficiencies,
  getRaces,
  getSkills,
  getSubclasses,
  getSubraces,
  getTraits,
  getWeaponProperties,
  getRules,
  // General API tool
  getApiResource,
} as const;

/**
 * System prompt fragment for teaching AI about D&D tools
 */
export const DND_TOOLS_PROMPT = `You have access to Dungeons & Dragons 5th Edition tools with LIVE API data. These tools fetch real D&D information from the official 5e API.

## CRITICAL: How to Use These Tools

### CORE D&D TOOLS

#### 1. getDndClassInfo (API-POWERED)
**When to use**: ANY question about D&D classes, features, progression
**Required Arguments**:
- className: EXACT class name from [Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard]
- level: Character level (1-20, optional, defaults to 1)

**Examples**:
- "Tell me about Fighter" → className: "Fighter"
- "What does a level 5 Wizard get?" → className: "Wizard", level: 5

#### 2. getSpellInfo (API-POWERED)
**When to use**: ANY spell questions
**Arguments**:
- spellName: Specific spell name OR leave empty to search
- level: Filter by spell level (0-9, optional)
- school: Filter by magic school (optional)

**Examples**:
- "Tell me about Fireball" → spellName: "Fireball"
- "What level 2 spells exist?" → level: 2
- "Show me Evocation spells" → school: "Evocation"

#### 3. generateDndCharacter (UPDATED)
**When to use**: Create characters with REAL API data
**Required Arguments**:
- name: AI should generate a creative, fantasy-appropriate name (e.g., "Theron Ironforge", "Luna Shadowleaf", "Kaelen Stormwind")
**Optional**: level, className, race

**Examples**:
- "Generate a character" → name: "Theron Ironforge" (AI creates name)
- "Create a level 5 Fighter" → name: "Gareth Stonehammer", className: "Fighter", level: 5
- "Make an Elf Wizard" → name: "Elara Moonwhisper", className: "Wizard", race: "Elf"

#### 4. calculateSkillCheck
**Required**: skill, abilityScore, level
**Optional**: proficient, expertise, advantage, disadvantage

#### 5. simulateCombatEncounter  
**Required**: partyLevel, partySize, difficulty

#### 6. rollDice
**Required**: notation (e.g., "2d6+3", "1d20")

### API RESOURCE TOOLS (Complete D&D Database Access)

#### Character Data Tools
- **getAbilityScores**: Get ability scores (STR, DEX, CON, INT, WIS, CHA)
- **getAlignments**: Get alignments (Lawful Good, Chaotic Evil, etc.)
- **getBackgrounds**: Get character backgrounds
- **getLanguages**: Get languages (Common, Elvish, Dwarvish, etc.)
- **getRaces**: Get races (Human, Elf, Dwarf, etc.)
- **getSubraces**: Get subraces (High Elf, Hill Dwarf, etc.)
- **getTraits**: Get racial traits

#### Class & Feature Tools
- **getFeatures**: Get class features
- **getSubclasses**: Get subclasses (Champion, Lore Master, etc.)
- **getProficiencies**: Get proficiencies (weapon, armor, skill, etc.)

#### Equipment & Item Tools
- **getEquipment**: Get equipment, weapons, armor, items
- **getEquipmentCategories**: Get equipment categories (weapons, armor, tools)
- **getMagicItems**: Get magic items
- **getWeaponProperties**: Get weapon properties (Finesse, Heavy, etc.)

#### Magic & Spell Tools
- **getMagicSchools**: Get schools of magic (Evocation, Illusion, etc.)

#### Monster & Combat Tools
- **getMonsters**: Get monsters (supports CR and type filtering)
- **getConditions**: Get conditions (blinded, charmed, frightened, etc.)
- **getDamageTypes**: Get damage types (fire, cold, lightning, etc.)

#### Rules & Reference Tools
- **getRules**: Get rules and rule sections
- **getFeats**: Get feats

#### General API Tool
- **getApiResource**: Access ANY endpoint directly. Use for exploration or when other tools don't cover specific needs.
  **Arguments**: endpoint (required), index (optional), subPath (optional)
  **Examples**:
  - "Get all classes" → endpoint: "classes"
  - "Get Fighter levels" → endpoint: "classes", index: "fighter", subPath: "levels"
  - "Get specific spell" → endpoint: "spells", index: "fireball"

## IMPORTANT NOTES:
- These tools use LIVE API data - no more hardcoded information
- Class names must be EXACT matches from the list above
- Spell names should be specific (e.g., "Fireball" not "fire spells")
- Always provide required parameters, ask if missing
- API data includes features, equipment, subclasses, and more
- Use getApiResource for exploring sub-endpoints and discovering new data

## Workflow:
Character Creation → generateDndCharacter + getDndClassInfo + getRaces + getBackgrounds
Combat → calculateSkillCheck + rollDice + simulateCombatEncounter + getMonsters + getConditions
Spells → getSpellInfo + getMagicSchools
Classes → getDndClassInfo + getSubclasses + getFeatures
Equipment → getEquipment + getEquipmentCategories + getMagicItems
Rules → getRules + getFeats
Exploration → getApiResource (discover any API endpoint)

USE THESE TOOLS for ALL D&D mechanics - they provide accurate, up-to-date information!`;
