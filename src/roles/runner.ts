import { move } from 'functions';

export interface Runner extends Creep {
  memory: RunnerMemory;
}

interface RunnerMemory extends CreepMemory {
  role: 'runner';
  depositing: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleRunner = {
  run(creep: Runner): void {
    const terminals = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TERMINAL } });
    const storages = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } });
    if (terminals.length > 0 && storages.length > 0) {
      const terminal = terminals[0];
      const storage = storages[0];
      if (terminal instanceof StructureTerminal && storage instanceof StructureStorage) {
        if (terminal.store[RESOURCE_ENERGY] >= 300000 /*|| storage.store.getUsedCapacity(RESOURCE_ENERGY) < 500000*/) {
          if (creep.pos.x != 36 || creep.pos.y != 37) {
            move(creep, new RoomPosition(36, 37, creep.memory.homeroom), 0);
          }
          return;
        }
      }
    }

    if (creep.memory.depositing && creep.store.getUsedCapacity() == 0) {
      creep.memory.depositing = false;
      delete creep.memory.target;
      delete creep.memory.path;
    } else if (!creep.memory.depositing && creep.store.getFreeCapacity() == 0) {
      creep.memory.depositing = true;
      delete creep.memory.target;
      delete creep.memory.path;
    }

    if (creep.memory.depositing) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          move(creep, target.pos);
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      } else {
        const targets = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TERMINAL } });
        if (targets[0] instanceof Structure && creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          delete creep.memory.path;
          creep.memory.target = targets[0].id;
          move(creep, targets[0].pos);
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof StructureStorage) {
          if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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
        const targets = creep.room.find(FIND_MY_STRUCTURES, {
          filter: function (structure) {
            return structure.structureType == STRUCTURE_STORAGE && hasEnergy(structure);
          }
        });
        if (targets[0]) {
          delete creep.memory.path;
          creep.memory.target = targets[0].id;
          if (targets[0] instanceof StructureStorage) {
            if (creep.withdraw(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              move(creep, targets[0].pos);
            } else {
              delete creep.memory.target;
              delete creep.memory.path;
            }
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

export default roleRunner;
