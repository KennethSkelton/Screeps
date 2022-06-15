export interface RangedDefender extends Creep {
  memory: RangedDefenderMemory;
}

interface RangedDefenderMemory extends CreepMemory {
  role: 'rangedDefender';
  favorsStructures: boolean;
}

const roleRangedDefender = {
  run(creep: RangedDefender): void {
    const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemies.length > 0) {
      attackNearestHostileCreep(creep, enemies);
    }
  }
};

function attackNearestHostileCreep(creep: Creep, enemies: Creep[]) {
  if (enemies.length > 0) {
    enemies.sort(
      (a, b) =>
        PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
        PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
    );
    if (creep.rangedAttack(enemies[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(enemies[0], { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}
export default roleRangedDefender;
