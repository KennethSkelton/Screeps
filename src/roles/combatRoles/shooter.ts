export interface Shooter extends Creep {
  memory: ShooterMemory;
}

interface ShooterMemory extends CreepMemory {
  role: 'shooter';
  favorsBuildings: boolean;
}

const roleShooter = {
  run(creep: Shooter): void {
    if (creep.memory.targetRoom) {
      if (creep.memory.targetRoom == creep.room.name) {
        if (creep.memory.favorsBuildings) {
          const structures = creep.room.find(FIND_HOSTILE_STRUCTURES);
          if (structures.length > 0) {
            structures.sort(
              (a, b) =>
                PathFinder.search(creep.pos, { pos: a.pos, range: 1 }).path.length -
                PathFinder.search(creep.pos, { pos: b.pos, range: 1 }).path.length
            );
            if (creep.rangedAttack(structures[0]) === ERR_NOT_IN_RANGE) {
              creep.moveTo(structures[0], { visualizePathStyle: { stroke: '#ffffff' } });
            }
          } else if (creep.room.controller) {
            if (creep.attackController(creep.room.controller) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          } else {
            creep.memory.favorsBuildings = false;
          }
          return;
        }
        if (!creep.memory.favorsBuildings) {
          const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
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
          return;
        } else {
          creep.memory.favorsBuildings = true;
        }
      } else {
        const route = Game.map.findRoute(creep.room, creep.memory.targetRoom);
        if (route != ERR_NO_PATH && route.length > 0) {
          console.log('Now heading to room ' + route[0].room);
          const exit = creep.pos.findClosestByRange(route[0].exit);
          if (exit) {
            creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
  }
};

export default roleShooter;
