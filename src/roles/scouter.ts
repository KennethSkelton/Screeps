import { RESERVE_TARGETS } from '../constants';

export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    creep.moveTo(new RoomPosition(25, 25, 'W11N56'), { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 1500 });
  }
};

export default roleScouter;
