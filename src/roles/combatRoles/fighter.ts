export interface Fighter extends Creep {
  memory: FighterMemory;
}

interface FighterMemory extends CreepMemory {
  role: 'fighter';
  favorsBuildings: boolean;
}

const roleFighter = {
  run(creep: Fighter): void {
    if (creep.memory.targetRoom && creep.memory.targetRoom != creep.room.name) {
      creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos);
    } else {
      if (creep.memory.favorsBuildings) {
        const structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (structures) {
          structures.sort(
            (a, b) =>
              PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
              PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
          );
          if (creep.attack(structures[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
        return;
      }
      if (!creep.memory.favorsBuildings) {
        const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
        if (enemies) {
          enemies.sort(
            (a, b) =>
              PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
              PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
          );
          if (creep.attack(enemies[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(enemies[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
        return;
      }
    }
  }
};

export default roleFighter;
