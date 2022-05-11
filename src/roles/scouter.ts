export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    if (creep.memory.targetRoom) {
      if (creep.room.name == creep.memory.targetRoom) {
        creep.moveTo(new RoomPosition(25, 25, creep.room.name));
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
