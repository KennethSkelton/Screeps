import { move } from 'functions';

export interface RemoteHarvester extends Creep {
  memory: RemoteHarvesterMemory;
}

export interface RemoteHarvesterMemory extends CreepMemory {
  role: 'remoteHarvester';
  sourceId?: Id<Source>;
  path?: RoomPosition[];
}

const roleRemoteHarvester = {
  run(creep: RemoteHarvester): void {
    if (creep.memory.targetRoom != creep.room.name && creep.memory.targetRoom) {
      creep.moveTo(Game.flags[`${creep.memory.targetRoom}_Staging_Area`].pos, {
        visualizePathStyle: { stroke: '#ffffff' }
      });
    } else {
      if (!creep.memory.sourceId) {
        const potentialSources: Id<Source>[] = [];
        const harvesters = _.filter(Game.creeps, (creep: RemoteHarvester) => creep.memory.role == 'remoteHarvester');
        const groupedHarvesters = _.groupBy(harvesters, function (n: RemoteHarvester) {
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
          move(creep, source.pos);
        } /*else if (harvestResult === OK) {
          creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
        }*/
        creep.memory.sourceId = source.id;
      } else {
        const source = Game.getObjectById(creep.memory.sourceId);
        if (source) {
          if (source.energy == 0) {
            delete creep.memory.sourceId;
          } else {
            const harvestResult = creep.harvest(source);
            if (harvestResult === ERR_NOT_IN_RANGE) {
              move(creep, source.pos);
            } /*else if (harvestResult === OK) {
              creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            }*/
          }
        }
      }
    }
  }
};
export default roleRemoteHarvester;
