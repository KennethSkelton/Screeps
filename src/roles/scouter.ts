import { RESERVE_TARGETS } from '../constants';

export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    creep.move(RIGHT);
    //creep.moveTo(new RoomPosition(25, 25, RESERVE_TARGETS[0]), { visualizePathStyle: { stroke: '#ffaa00' } });
  }
};

export default roleScouter;
