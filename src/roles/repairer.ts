import { move } from 'functions';
import profiler from 'screeps-profiler';
import { RETRIEVE_PRIORITY } from '../constants';

export interface Repairer extends Creep {
  memory: RepairerMemory;
}

interface RepairerMemory extends CreepMemory {
  role: 'repairer';
  repairing: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleRepairer = {
  run(creep: Repairer): void {
    if (creep.memory.repairing && creep.store.getUsedCapacity() == 0) {
      creep.memory.repairing = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
      creep.say('⚡ repairing');
    }

    if (creep.memory.repairing) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (target.hits < target.hitsMax) {
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
          delete creep.memory.target;
          delete creep.memory.path;
        }
      } else {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: function (n: Structure) {
            return !(n instanceof StructureWall || n instanceof StructureRampart) && isDamaged(n);
          }
        });
        targets.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

        if (targets.length > 0) {
          delete creep.memory.path;
          creep.memory.target = targets[0].id;
          move(creep, targets[0].pos);
        } else {
          delete creep.memory.path;
          delete creep.memory.target;
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else if (target instanceof Resource) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
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

profiler.registerObject(roleRepairer, 'role.repairer');

export default roleRepairer;
