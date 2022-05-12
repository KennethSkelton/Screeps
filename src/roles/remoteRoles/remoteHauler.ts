import { FILL_PRIORITY, HOME_SPAWN, RETRIEVE_PRIORITY } from '../../constants';

export interface remoteHauler extends Creep {
  memory: remoteHaulerMemory;
}

interface remoteHaulerMemory extends CreepMemory {
  role: 'hauler';
  haulingHome: boolean;
}

const roleRemoteHauler = {
  run(creep: remoteHauler): void {
    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.haulingHome = true;
    } else if (creep.store.getUsedCapacity() == 0) {
      creep.memory.haulingHome = false;
    }

    if (creep.memory.haulingHome) {
      if (Game.spawns[HOME_SPAWN].room) {
        const targets = Game.rooms[Game.spawns[HOME_SPAWN].room.name].find(FIND_STRUCTURES, { filter: isToBeFilled });
        let target: Structure = Game.spawns[HOME_SPAWN];
        if (targets.length > 0) {
          const groupedTargets = _.groupBy(targets, function (n) {
            return n.structureType;
          });

          for (const type of FILL_PRIORITY) {
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
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    } else {
      if (creep.memory.targetRoom && creep.memory.targetRoom != creep.room.name) {
        creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos, {
          visualizePathStyle: { stroke: '#ffffff' }
        });
      } else {
        const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
        if (targets.length > 0) {
          const groupedTargets = _.groupBy(targets, function (n) {
            return n.structureType;
          });
          let target;
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
          if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          }
        } else {
          const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: function (object: Resource) {
              return object.amount >= 50;
            }
          });
          // eslint-disable-next-line max-len
          const target = creep.pos.findClosestByRange(droppedResources);
          if (target) {
            if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
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
