import { WorldRegistry } from './WorldRegistry';
import { interiorWorld } from './interior/InteriorWorld';
import { menuWorld } from './menu/MenuWorld';
import { planetWorld } from './planet/PlanetWorld';

export const worldRegistry = new WorldRegistry([
  menuWorld,
  planetWorld,
  interiorWorld,
]);

export type { InteractionTrigger, WorldId } from './types';
export type { NPCData } from '../entities/NPC';
export type { HouseContent } from '../entities/House';