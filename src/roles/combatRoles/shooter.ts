import { moveToRoom } from 'functions';

export interface Shooter extends Creep {
  memory: ShooterMemory;
}

interface ShooterMemory extends CreepMemory {
  role: 'shooter';
  favorsStructures: boolean;
}

const roleShooter = {
  run(creep: Shooter): void {
    if (creep.memory.targetRoom) {
      if (creep.memory.targetRoom === creep.room.name) {
        if (creep.memory.favorsStructures) {
          attackStructuresBeforeCreeps(creep);
        } else {
          attackCreepsBeforeStructures(creep);
        }
      } else {
        moveToRoom(creep);
      }
    }
  }
};

function attackCreepsBeforeStructures(creep: Creep) {
  const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
  if (enemies.length > 0) {
    attackNearestHostileCreep(creep, enemies);
  } else {
    const structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
      filter: function (structure) {
        return structure.structureType != STRUCTURE_CONTROLLER;
      }
    });
    if (structures.length > 0) {
      attackNearestHostileStructure(creep, structures);
    } else {
      creep.moveTo(25, 25, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}

function attackStructuresBeforeCreeps(creep: Creep) {
  const structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
    filter: function (structure) {
      return structure.structureType != STRUCTURE_CONTROLLER;
    }
  });
  if (structures.length > 0) {
    attackNearestHostileStructure(creep, structures);
  } else {
    const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemies.length > 0) {
      attackNearestHostileCreep(creep, enemies);
    } else {
      creep.moveTo(25, 25, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}

function attackNearestHostileStructure(creep: Creep, structures: AnyOwnedStructure[]) {
  if (structures.length > 0) {
    structures.sort(
      (a, b) =>
        PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
        PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
    );
    if (creep.rangedAttack(structures[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}

function attackNearestHostileCreep(creep: Creep, enemies: Creep[]) {
  if (enemies.length > 0) {
    enemies.sort(
      (a, b) =>
        PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
        PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
    );
    if (creep.rangedAttack(enemies[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(enemies[0], { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}
export default roleShooter;
