import { RESERVE_TARGETS } from '../constants';

export interface Claimer extends Creep {
  memory: ClaimerMemory;
}

interface ClaimerMemory extends CreepMemory {
  role: 'claimer';
}

const roleClaimer = {
  run(creep: Claimer): void {
    /*
    const target = Game.rooms[RESERVE_TARGETS[0]].controller;
    if (target) {
      if (creep.reserveController(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }*/
  }
};

export default roleClaimer;
