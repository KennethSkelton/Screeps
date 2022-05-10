export interface remoteHarvester extends Creep {
  memory: remoteHarvesterMemory;
}

export interface remoteHarvesterMemory extends CreepMemory {
  role: 'remoteHarvester';
  sourceId?: Id<Source>;
}

const roleRemoteHarvester = {
  run(creep: remoteHarvester): void {
    if (creep.memory.targetRoom != creep.room.name && creep.memory.targetRoom) {
      creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos);
    } else {
      if (!creep.memory.sourceId) {
        const potentialSources: Id<Source>[] = [];
        const harvesters = _.filter(Game.creeps, (creep: remoteHarvester) => creep.memory.role == 'remoteHarvester');
        const groupedHarvesters = _.groupBy(harvesters, function (n: remoteHarvester) {
          return n.memory.sourceId;
        });

        delete groupedHarvesters['undefined'];
        for (const [sourceId, sourceInfoObject] of Object.entries(Memory.rooms[creep.room.name].sources)) {
          if (!groupedHarvesters[sourceId] || groupedHarvesters[sourceId].length < sourceInfoObject.workerSpots) {
            potentialSources.push(sourceId as Id<Source>);
            //break;
          }
        }
        let source = Game.getObjectById(potentialSources[0]);

        if (!source) {
          source = creep.room.find(FIND_SOURCES)[0];
        }
        const harvestResult = creep.harvest(source);
        if (harvestResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (harvestResult === OK) {
          creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
        }
        creep.memory.sourceId = source.id;
      } else {
        const source = Game.getObjectById(creep.memory.sourceId);
        if (source) {
          if (source.energy == 0) {
            delete creep.memory.sourceId;
          } else if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
  }
};
export default roleRemoteHarvester;
