export interface Claimer extends Creep {
  memory: ClaimerMemory;
}

interface ClaimerMemory extends CreepMemory {
  role: 'claimer';
}

const roleClaimer = {
  run(creep: Claimer): void {
    if (creep.memory.targetRoom) {
      if (Game.rooms[creep.memory.targetRoom]) {
        const target = Game.rooms[creep.memory.targetRoom].controller;
        if (target) {
          if (creep.reserveController(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
          } else {
            if (Memory.remoteOperations[creep.memory.targetRoom].stage < 2) {
              Memory.remoteOperations[creep.memory.targetRoom].stage = 2;
            }
          }
        }
      }
    }
  }
};

export default roleClaimer;
