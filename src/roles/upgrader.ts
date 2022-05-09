export interface Upgrader extends Creep {
  memory: UpgraderMemory;
}

interface UpgraderMemory extends CreepMemory {
  role: 'upgrader';
  upgrading: boolean;
}

const roleUpgrader = {

  run(creep: Upgrader): void {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
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

export default roleUpgrader;
