import { move } from 'functions';

export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleScouter = {
  run(creep: Scouter): void {
    if (creep.memory.targetRoom) {
      if (creep.room.name == creep.memory.targetRoom) {
        if (creep.pos.x != 25 || creep.pos.y != 25) {
          move(creep, new RoomPosition(25, 25, creep.memory.targetRoom));
        }
        if (Memory.remoteOperations[creep.memory.targetRoom].stage < 1) {
          Memory.remoteOperations[creep.memory.targetRoom].stage = 1;
        }
      } else {
        const route = Game.map.findRoute(creep.room, creep.memory.targetRoom);
        if (route != ERR_NO_PATH && route.length > 0) {
          console.log('Now heading to room ' + route[0].room);
          const exit = creep.pos.findClosestByRange(route[0].exit);
          if (exit) {
            creep.moveTo(exit);
          }
        }
      }
    }
  }
};

export default roleScouter;
