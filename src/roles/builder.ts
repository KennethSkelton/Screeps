export interface Builder extends Creep {
  memory: BuilderMemory;
}

interface BuilderMemory extends CreepMemory {
  building: boolean;
  role: 'builder';
}

const roleBuilder = {
  run(creep: Builder): void {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    } else {
      const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
      // eslint-disable-next-line max-len
      droppedResources.sort((a, b) => PathFinder.search(creep.pos, {pos: a.pos, range : 1}).path.length - PathFinder.search(creep.pos, {pos: b.pos, range : 1}).path.length)

      if(droppedResources.length != 0){
        if (creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE){
          creep.moveTo(droppedResources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else{
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }
};

export default roleBuilder;
