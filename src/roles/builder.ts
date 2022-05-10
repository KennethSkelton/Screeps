import { RETRIEVE_PRIORITY } from '../constants';
import { HOME_SPAWN } from '../constants';

export interface Builder extends Creep {
  memory: BuilderMemory;
}

interface BuilderMemory extends CreepMemory {
  building: boolean;
  role: 'builder';
}

const roleBuilder = {
  run(creep: Builder): void {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
      console.log(JSON.stringify(targets, null, 4));
      let target: Structure = Game.spawns[HOME_SPAWN];
      if (targets.length > 0) {
        const groupedTargets = _.groupBy(targets, function (n) {
          return n.structureType;
        });

        for (const type of RETRIEVE_PRIORITY) {
          if (groupedTargets[type]) {
            // eslint-disable-next-line max-len
            groupedTargets[type].sort(
              (a, b) =>
                PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
                PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
            );
            target = groupedTargets[type][0];
            break;
          }
        }
        if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
        // eslint-disable-next-line max-len
        droppedResources.sort(
          (a, b) =>
            PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
            PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
        );

        if (droppedResources.length != 0) {
          if (creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedResources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
  }
};

function hasEnergy(structure: Structure): boolean {
  if (
    structure.structureType === STRUCTURE_EXTENSION ||
    structure.structureType === STRUCTURE_SPAWN ||
    structure.structureType === STRUCTURE_TOWER ||
    structure.structureType === STRUCTURE_CONTAINER ||
    structure.structureType === STRUCTURE_STORAGE
  ) {
    // eslint-disable-next-line max-len
    const s = structure as StructureExtension | StructureSpawn | StructureTower | StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getUsedCapacity() > 0;
    } else {
      return s.energy > 0;
    }
  }
  return false;
}

export default roleBuilder;
