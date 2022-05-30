import { move, moveToRoom } from 'functions';

export interface Claimer extends Creep {
  memory: ClaimerMemory;
}

interface ClaimerMemory extends CreepMemory {
  role: 'claimer';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleClaimer = {
  run(creep: Claimer): void {
    if (creep.memory.targetRoom != creep.room.name && creep.memory.targetRoom) {
      creep.memory.target = Game.rooms[creep.memory.targetRoom].controller?.id;
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target && target instanceof StructureController) {
          if (creep.reserveController(target) === ERR_NOT_IN_RANGE) {
            move(creep, target.pos);
          } else {
            if (Memory.remoteOperations[creep.memory.targetRoom].stage < 2) {
              Memory.remoteOperations[creep.memory.targetRoom].stage = 2;
            }
          }
        }
      }
    } else {
      moveToRoom(creep);
    }
  }
};

export default roleClaimer;
