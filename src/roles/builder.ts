import { RETRIEVE_PRIORITY } from '../constants';
import { move } from '../functions';

export interface Builder extends Creep {
  memory: BuilderMemory;
}

interface BuilderMemory extends CreepMemory {
  building: boolean;
  role: 'builder';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleBuilder = {
  run(creep: Builder): void {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
      delete creep.memory.target;
      delete creep.memory.path;
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
      delete creep.memory.target;
      delete creep.memory.path;
    }

    if (creep.memory.building) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof ConstructionSite) {
          const buildResult = creep.build(target);
          if (buildResult === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
          } else if (buildResult != OK) {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      } else {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        const target = creep.pos.findClosestByPath(targets);
        if (target) {
          delete creep.memory.path;
          creep.memory.target = target.id;
          move(creep, target.pos);
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          const error = creep.withdraw(target, RESOURCE_ENERGY);
          if (error === ERR_NOT_IN_RANGE) {
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
              const target = creep.pos.findClosestByRange(groupedTargets[type]);
              if (target) {
                creep.memory.target = target?.id;
                move(creep, target.pos);
                break;
              }
            }
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
            move(creep, target.pos);
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
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

export default roleBuilder;
