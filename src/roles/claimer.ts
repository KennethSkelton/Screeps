import { RESERVE_TARGETS } from '../constants';

export interface Claimer extends Creep {
  memory: ClaimerMemory;
}

interface ClaimerMemory extends CreepMemory {
  role: 'claimer';
}

const roleClaimer = {
  run(creep: Claimer): void {
    if (Game.rooms[RESERVE_TARGETS[0]]) {
      const target = Game.rooms[RESERVE_TARGETS[0]].controller;
      if (target) {
        if (creep.reserveController(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 1500 });
        }
      }
    }
  }
};

export default roleClaimer;
