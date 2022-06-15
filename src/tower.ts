function runTower(tower: StructureTower): void {
  const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

  if (closestHostile && tower.pos.getRangeTo(closestHostile) < 20) {
    tower.attack(closestHostile);
  }
}

function isDamaged(structure: Structure): boolean {
  if (structure.structureType != STRUCTURE_RAMPART) {
    return false;
  }
  return structure.hits < structure.hitsMax;
}

export { isDamaged, runTower };
