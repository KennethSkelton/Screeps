export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    if (creep.memory.targetRoom) {
      creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom), { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.room.name == creep.memory.targetRoom) {
        if (Memory.remoteOperations[creep.memory.targetRoom].stage < 1) {
          Memory.remoteOperations[creep.memory.targetRoom].stage = 1;
        }
      }
    }
  }
};

export default roleScouter;
