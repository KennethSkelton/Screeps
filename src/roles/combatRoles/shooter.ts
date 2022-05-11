export interface Shooter extends Creep {
  memory: ShooterMemory;
}

interface ShooterMemory extends CreepMemory {
  role: 'shooter';
}

const roleShooter = {
  run(creep: Shooter): void {
    return;
  }
};

export default roleShooter;
