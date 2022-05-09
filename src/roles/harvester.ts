export interface Harvester extends Creep{
  memory: HarvesterMemory;
}

interface HarvesterMemory extends CreepMemory {
  role: 'harvester';
  sourceId?: Id<Source>;
}



const roleHarvester = {
  run(creep: Harvester): void {
      if(!creep.memory.sourceId){
      const potentialSources : Id<Source>[] = []
      const harvesters = _.filter(Game.creeps, (creep: Harvester) => creep.memory.role == 'harvester');
      const groupedHarvesters = _.groupBy(harvesters, function(n: Harvester) {
        return n.memory.sourceId
      })

      delete groupedHarvesters["undefined"]
      for(const [sourceId, sourceInfoObject] of Object.entries(Memory.rooms[creep.room.name].sources)){
        if(!groupedHarvesters[sourceId] || (groupedHarvesters[sourceId].length < sourceInfoObject.workerSpots)){
          potentialSources.push(sourceId as Id<Source>)
          //break;
        }
      }

      // eslint-disable-next-line max-len
      potentialSources.sort((a, b) => PathFinder.search(creep.pos, {pos: Game.getObjectById(a)!.pos, range : 1}).path.length - PathFinder.search(creep.pos, {pos: Game.getObjectById(b)!.pos, range : 1}).path.length)


      let source = Game.getObjectById(potentialSources[0])
      if(!source){
        source = creep.room.find(FIND_SOURCES)[0]
      }
      console.log(`${creep.name} ${source.id}`)
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      creep.memory.sourceId = source.id
      }
      else{
        const source = Game.getObjectById(creep.memory.sourceId)
        if(source){
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
}
export default roleHarvester;

