import { move } from 'functions';
import profiler from 'screeps-profiler';
import { RETRIEVE_PRIORITY } from '../constants';

export interface Upgrader extends Creep {
  memory: UpgraderMemory;
}

interface UpgraderMemory extends CreepMemory {
  role: 'upgrader';
  upgrading: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleUpgrader = {
  run(creep: Upgrader): void {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
      delete creep.memory.target;
      delete creep.memory.path;
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
      delete creep.memory.target;
      delete creep.memory.path;
    }

    if (creep.memory.upgrading) {
      if (creep.room.controller) {
        if (creep.room.controller.sign?.text != "What doesn't grow dies, and what dies grows the Tarmogoyf")
          if (
            creep.signController(creep.room.controller, "What doesn't grow dies, and what dies grows the Tarmogoyf") ==
            ERR_NOT_IN_RANGE
          ) {
            creep.moveTo(creep.room.controller);
          }
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          move(creep, creep.room.controller.pos);
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            console.log('Try to move');
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
          const droppedResource = creep.pos.findClosestByPath(droppedResources);
          if (droppedResource) {
            delete creep.memory.path;
            creep.memory.target = droppedResource.id;
            move(creep, droppedResource.pos);
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
profiler.registerObject(roleUpgrader, 'role.upgrader');

export default roleUpgrader;
