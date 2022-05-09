export interface Hauler extends Creep {
    memory: HaulerMemory;
  }

  interface HaulerMemory extends CreepMemory {
    building: boolean;
    role: 'hauler';
  }

const roleHauler = {
  run(creep: Hauler): void {
    if(creep.store.getFreeCapacity() > 0){
      const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
      // eslint-disable-next-line max-len
      droppedResources.sort((a, b) => PathFinder.search(creep.pos, {pos: a.pos, range : 1}).path.length - PathFinder.search(creep.pos, {pos: b.pos, range : 1}).path.length)
      if(droppedResources.length != 0){
        if (creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE){
          creep.moveTo(droppedResources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
    else{
      const targets = creep.room.find(FIND_MY_STRUCTURES, { filter: isToBeFilled });
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};

function isToBeFilled(structure: Structure): boolean {
if (structure.structureType === STRUCTURE_EXTENSION
    || structure.structureType === STRUCTURE_SPAWN
    || structure.structureType === STRUCTURE_TOWER
    || structure.structureType === STRUCTURE_CONTAINER
) {
    const s = structure as StructureExtension | StructureSpawn | StructureTower | StructureContainer;
    if(s instanceof StructureContainer){
        return s.store.getFreeCapacity() > 0
    }else{
        return s.energy < s.energyCapacity;
    }
}
return false;
}

  export default roleHauler;
