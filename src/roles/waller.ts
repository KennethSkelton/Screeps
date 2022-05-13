import { move } from 'functions';
import { RETRIEVE_PRIORITY } from '../constants';

export interface Waller extends Creep {
  memory: WallerMemory;
}

interface WallerMemory extends CreepMemory {
  role: 'waller';
  walling: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleWaller = {
  /** @param {Creep} creep **/
  run(creep: Waller): void {
    //work
    if (creep.memory.walling && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.walling = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.walling && creep.store.getFreeCapacity() == 0) {
      creep.memory.walling = true;
      creep.say('⚡ walling');
    }

    if (creep.memory.walling) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof StructureRampart || target instanceof StructureWall) {
          const repairResult = creep.repair(target);
          if (repairResult === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
          } else if (repairResult != OK) {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      } else {
        const allWallsAndRamparts = creep.room.find(FIND_STRUCTURES, {
          filter: function (n: Structure) {
            return (n instanceof StructureWall || n instanceof StructureRampart) && isDamaged(n);
          }
        });
        if (allWallsAndRamparts.length > 0) {
          let averageStrength = 0;
          allWallsAndRamparts.forEach(function (target) {
            averageStrength += target.hits;
          });
          averageStrength = averageStrength / allWallsAndRamparts.length;
          const targetStength = averageStrength * 1.05;
          const targets = creep.room.find(FIND_STRUCTURES, {
            filter: function (n: Structure) {
              return (
                (n instanceof StructureWall || n instanceof StructureRampart) && isDamaged(n) && n.hits < targetStength
              );
            }
          });
          if (targets.length > 0) {
            const target = creep.pos.findClosestByPath(targets);
            if (target) {
              delete creep.memory.path;
              creep.memory.target = target.id;
              move(creep, target.pos);
            }
          }
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
      if (targets.length > 0) {
        const groupedTargets = _.groupBy(targets, function (n) {
          return n.structureType;
        });
        for (const type of RETRIEVE_PRIORITY) {
          if (groupedTargets[type]) {
            const target = creep.pos.findClosestByPath(groupedTargets[type]);
            if (target) {
              delete creep.memory.path;
              creep.memory.target = target.id;
              move(creep, target.pos);
              break;
            }
          }
        }
      } else {
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
        const target = creep.pos.findClosestByPath(droppedResources);
        if (target) {
          delete creep.memory.path;
          creep.memory.target = target.id;
          move(creep, target.pos);
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

export default roleWaller;
