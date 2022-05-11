function runTower(tower: StructureTower): void {
  const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

  if (closestHostile) {
    tower.attack(closestHostile);
  } else if (tower.room.energyAvailable / tower.room.energyCapacityAvailable > 0.5) {
    const targets = tower.room.find(FIND_STRUCTURES, { filter: isDamaged });
    targets.sort((a, b) => a.hits - b.hits);
    if (targets.length > 0) {
      tower.repair(targets[0]);
    }
  }
}

function isDamaged(structure: Structure): boolean {
  if (structure.structureType != STRUCTURE_RAMPART) {
    return false;
  }
  return structure.hits < structure.hitsMax;
}

export { isDamaged, runTower };
