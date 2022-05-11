import roleRepairer, { Repairer } from 'roles/repairer';
import { RETRIEVE_PRIORITY } from '../../constants';

export interface remoteBuilder extends Creep {
  memory: remoteBuilderMemory;
}

interface remoteBuilderMemory extends CreepMemory {
  building: boolean;
  role: 'remoteBuilder';
}

const roleRemoteBuilder = {
  run(creep: remoteBuilder): void {
    if (creep.memory.targetRoom != creep.room.name && creep.memory.targetRoom) {
      creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos);
    } else {
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
        if (targets) {
          if (targets.length > 1) {
            targets.sort(
              (a, b) =>
                PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
                PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
            );
          }
          if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        } else {
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
        }
      } else {
        const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
        let target;
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
          if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
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
  }
};

function isDamaged(structure: Structure): boolean {
  return structure.hits < structure.hitsMax;
}

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

export default roleRemoteBuilder;
