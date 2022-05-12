import { FILL_PRIORITY, HOME_SPAWN } from '../constants';

export interface Hauler extends Creep {
  memory: HaulerMemory;
}

interface HaulerMemory extends CreepMemory {
  role: 'hauler';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleHauler = {
  run(creep: Hauler): void {
    if (creep.store.getUsedCapacity() == 0) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Resource) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            if (creep.memory.path) {
              creep.move(creep.pos.getDirectionTo(creep.memory.path[0]));
              creep.room.visual.poly(creep.memory.path);
            } else {
              creep.memory.path = PathFinder.search(creep.pos, target.pos).path;
            }
          }
        } else {
          delete creep.memory.target;
        }
      } else {
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: function (object: Resource) {
            return object.amount >= 50;
          }
        });
        const target = creep.pos.findClosestByPath(droppedResources);
        if (target) {
          delete creep.memory.path;
          creep.memory.target = target.id;
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            if (creep.memory.path) {
              creep.move(creep.pos.getDirectionTo(creep.memory.path[0]));
              creep.room.visual.poly(creep.memory.path);
              creep.memory.path.shift();
              creep.memory.path = creep.memory.path;
            } else {
              creep.memory.path = PathFinder.search(creep.pos, target.pos).path;
            }
          }
        } else {
          delete creep.memory.target;
        }
      } else {
        const targets = creep.room.find(FIND_STRUCTURES, { filter: isToBeFilled });
        if (targets.length > 0) {
          const groupedTargets = _.groupBy(targets, function (n) {
            return n.structureType;
          });

          for (const type of FILL_PRIORITY) {
            if (groupedTargets[type]) {
              const target = creep.pos.findClosestByPath(groupedTargets[type]);
              if (target) {
                delete creep.memory.path;
                creep.memory.target = target.id;
              }
            }
          }
        }
      }
    }
  }
};

function isToBeFilled(structure: Structure): boolean {
  if (
    structure.structureType === STRUCTURE_EXTENSION ||
    structure.structureType === STRUCTURE_SPAWN ||
    structure.structureType === STRUCTURE_TOWER ||
    structure.structureType === STRUCTURE_CONTAINER ||
    structure.structureType === STRUCTURE_STORAGE
  ) {
    const s = structure as StructureExtension | StructureSpawn | StructureTower | StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getFreeCapacity() > 0;
    } else if (s instanceof StructureTower) {
      return s.store.getFreeCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY) > 0.5;
    } else {
      return s.energy < s.energyCapacity;
    }
  }
  return false;
}

export default roleHauler;
