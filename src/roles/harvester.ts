export interface Harvester extends Creep{
  memory: HarvesterMemory;
}

interface HarvesterMemory extends CreepMemory {
  role: 'harvester';
  sourceId?: Id<Source>;
}



const roleHarvester = {
  run(creep: Harvester): void {
    if(creep.room.find(FIND_MY_STRUCTURES, { filter: isToBeFilled }).length == 0 || creep.store.getFreeCapacity() > 0) {
      if (!creep.memory.sourceId){
        const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');
        const groupedHarvesters = _.groupBy(harvesters, 'sourceId')

        for(const [sourceId, sourceInfoObject] of Object.entries(Memory.rooms[creep.room.name].sources)){
          console.log(sourceId)
          console.log(sourceInfoObject.toString())
          console.log(groupedHarvesters.toString())

          if(groupedHarvesters[sourceId].length < sourceInfoObject.workerSpots){
            creep.memory.sourceId = sourceId as Id<Source>
          }
        }
      }
      let source = Game.getObjectById(creep.memory.sourceId as Id<Source>)
      if(!source){
        source = creep.room.find(FIND_SOURCES)[0]
      }
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
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
