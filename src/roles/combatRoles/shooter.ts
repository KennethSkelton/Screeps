export interface Shooter extends Creep {
  memory: ShooterMemory;
}

interface ShooterMemory extends CreepMemory {
  role: 'shooter';
  favorsBuildings: boolean;
}

const roleShooter = {
  run(creep: Shooter): void {
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
          if (creep.rangedAttack(structures[0]) === ERR_NOT_IN_RANGE) {
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
          if (creep.rangedAttack(enemies[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(enemies[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
        return;
      }
    }
  }
};

export default roleShooter;
