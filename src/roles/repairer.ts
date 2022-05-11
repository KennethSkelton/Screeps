import { RETRIEVE_PRIORITY } from '../constants';
import { HOME_SPAWN } from '../constants';

export interface Repairer extends Creep {
  memory: RepairerMemory;
}

interface RepairerMemory extends CreepMemory {
  role: 'repairer';
  repairing: boolean;
}

const roleRepairer = {
  /** @param {Creep} creep **/
  run(creep: Repairer): void {
    //work
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
      creep.say('⚡ repairing');
    }

    if (creep.memory.repairing) {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: function (n: Structure) {
          return !(n instanceof StructureWall || n instanceof StructureRampart) && isDamaged(n);
        }
      });

      targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

      if (targets.length > 0) {
        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
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
  if (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) {
    // eslint-disable-next-line max-len
    const s = structure as StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getUsedCapacity() > 0;
    }
  }
  return false;
}

function isDamaged(structure: Structure): boolean {
  return structure.hits < structure.hitsMax;
}

export default roleRepairer;
