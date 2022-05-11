export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
  path: string;
}

const roleScouter = {
  run(creep: Scouter): void {
    if (creep.memory.targetRoom) {
      if (!creep.memory.path) {
        const path = creep.pos.findPathTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        creep.memory.path = Room.serializePath(path);
      }
      creep.moveByPath(creep.memory.path);
      if (creep.room.name == creep.memory.targetRoom) {
        if (Memory.remoteOperations[creep.memory.targetRoom].stage < 1) {
          Memory.remoteOperations[creep.memory.targetRoom].stage = 1;
        }
      }
    }
  }
};

export default roleScouter;
