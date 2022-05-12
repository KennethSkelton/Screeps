export interface Stunner extends Creep {
  memory: StunnerMemory;
}

interface StunnerMemory extends CreepMemory {
  role: 'stunner';
}

const roleStunner = {
  run(creep: Stunner): void {
    if (creep.memory.targetRoom) {
      if (creep.memory.targetRoom == creep.room.name) {
        if (creep.room.controller) {
          if (!creep.room.controller?.my) {
            if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          }
        }
      } else {
        const route = Game.map.findRoute(creep.room, creep.memory.targetRoom);
        if (route != ERR_NO_PATH && route.length > 0) {
          console.log('Now heading to room ' + route[0].room);
          const exit = creep.pos.findClosestByRange(route[0].exit);
          if (exit) {
            creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
  }
};

export default roleStunner;
