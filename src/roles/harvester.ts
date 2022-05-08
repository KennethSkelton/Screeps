export interface Harvester extends Creep{
  memory: HarvesterMemory;
}

interface HarvesterMemory extends CreepMemory {
  role: 'harvester';
  sourceId?: Id<Source>;
}



const roleHarvester = {
  run(creep: Harvester): void {
    if (creep.store.getFreeCapacity() > 0) {
      const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');
      const groupedHarvesters = _.groupBy(harvesters, 'sourceId')

      for(const [sourceId, harvestersAssigned] of Object.entries(groupedHarvesters)){
        if(Memory.rooms[creep.room.name].sources[sourceId as Id<Source>].workerSpots > harvestersAssigned.length){
          const source = Game.getObjectById(sourceId as Id<Source>)
          if(!source){
            continue
          }
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          creep.memory.sourceId = sourceId as Id<Source>
        }
      }
    } else {
      if(creep.memory.sourceId){
        delete creep.memory.sourceId
      }
      const targets = creep.room.find(FIND_MY_STRUCTURES, { filter: isToBeFilled });

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
      else{
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }

};

function isToBeFilled(structure: Structure): boolean {
  if (structure.structureType === STRUCTURE_EXTENSION
    || structure.structureType === STRUCTURE_SPAWN
    || structure.structureType === STRUCTURE_TOWER
  ) {
    const s = structure as StructureExtension | StructureSpawn | StructureTower;
    return s.energy < s.energyCapacity;
  }
  return false;
}

export default roleHarvester;
export { isToBeFilled };
