import { RESERVE_TARGETS } from '../constants';

export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    creep.moveTo(RoomPosition(0, 0, RESERVE_TARGETS[0]));
  }
};

export { roleScouter };
