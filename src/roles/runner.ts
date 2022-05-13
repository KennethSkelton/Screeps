export interface Runner extends Creep {
  memory: RunnerMemory;
}

interface RunnerMemory extends CreepMemory {
  role: 'role';
}

const roleRunner = {
  run(creep: Runner): void {}
};

export default roleRunner;
