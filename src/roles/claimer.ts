import { move } from 'functions';

export interface Claimer extends Creep {
  memory: ClaimerMemory;
}

interface ClaimerMemory extends CreepMemory {
  role: 'claimer';
  path?: RoomPosition[];
}

const roleClaimer = {
  run(creep: Claimer): void {
    if (creep.memory.targetRoom) {
      if (Game.rooms[creep.memory.targetRoom]) {
        const target = Game.rooms[creep.memory.targetRoom].controller;
        if (target) {
          if (creep.reserveController(target) === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
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
