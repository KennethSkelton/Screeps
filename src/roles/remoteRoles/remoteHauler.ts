import { move, moveToRoom } from 'functions';
import { FILL_PRIORITY } from '../../constants';

export interface remoteHauler extends Creep {
  memory: remoteHaulerMemory;
}

interface remoteHaulerMemory extends CreepMemory {
  role: 'hauler';
  depositing: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleRemoteHauler = {
  run(creep: remoteHauler): void {
    if (creep.memory.depositing && creep.store.getUsedCapacity() == 0) {
      creep.memory.depositing = false;
      delete creep.memory.target;
      delete creep.memory.path;
    } else if (!creep.memory.depositing && creep.store.getFreeCapacity() == 0) {
      creep.memory.depositing = true;
      delete creep.memory.target;
      delete creep.memory.path;
    }
    if (!creep.memory.depositing) {
      if (creep.room.name != creep.memory.targetRoom) {
        moveToRoom(creep);
      } else {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target instanceof Resource) {
            if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
              move(creep, target);
            } else {
              delete creep.memory.target;
              delete creep.memory.path;
            }
          } else if (target instanceof Structure) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              move(creep, target);
            } else {
              delete creep.memory.target;
              delete creep.memory.path;
            }
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: function (object: Resource) {
              return object.amount >= 50;
            }
          });
          if (droppedResources.length > 0) {
            const target = creep.pos.findClosestByPath(droppedResources);
            if (target) {
              delete creep.memory.path;
              creep.memory.target = target.id;
              move(creep, target);
            }
          } else {
            const targets = creep.room.find(FIND_STRUCTURES, {
              filter: function (structure) {
                return structure.structureType == STRUCTURE_CONTAINER && hasEnergy(structure);
              }
            });
            const target = creep.pos.findClosestByPath(targets);
            if (target) {
              delete creep.memory.path;
              creep.memory.target = target.id;
              move(creep, target);
            }
          }
        }
      }
    } else {
      if (creep.room.name != creep.memory.homeroom) {
        moveToRoom(creep);
      } else {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target instanceof Structure && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            move(creep, target);
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
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
                  move(creep, target);
                  break;
                }
              }
            }
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

export default roleRemoteHauler;
