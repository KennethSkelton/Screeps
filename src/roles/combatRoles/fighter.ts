export interface Fighter extends Creep {
  memory: FighterMemory;
}

interface FighterMemory extends CreepMemory {
  role: 'fighter';
  favorsBuildings: boolean;
}

const roleFighter = {
  run(creep: Fighter): void {
    if (creep.memory.favorsBuildings) {
    }
  }
};

export default roleFighter;
