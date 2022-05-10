import { RESERVE_TARGETS } from '../constants';

export interface Scouter extends Creep {
  memory: ScouterMemory;
}

interface ScouterMemory extends CreepMemory {
  role: 'scouter';
}

const roleScouter = {
  run(creep: Scouter): void {
    creep.moveTo(49, 33);
    //creep.moveTo(RoomPosition(25, 25, 'W11N56'));
  }
};

export default roleScouter;
