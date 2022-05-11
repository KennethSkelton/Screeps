export interface Stunner extends Creep {
  memory: StunnerMemory;
}

interface StunnerMemory extends CreepMemory {
  role: 'stunner';
}

const roleStunner = {
  run(creep: Stunner): void {
    if (creep.memory.targetRoom && creep.memory.targetRoom != creep.room.name) {
      creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos);
    } else {
      if (creep.room.controller) {
        if (!creep.room.controller?.my) {
          if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
          }
        }
      }
    }
  }
};

export default roleStunner;
