import { move } from 'functions';

export interface Harvester extends Creep {
  memory: HarvesterMemory;
}

export interface HarvesterMemory extends CreepMemory {
  role: 'harvester';
  sourceId?: Id<Source>;
  path?: RoomPosition[];
}

const roleHarvester = {
  run(creep: Harvester): void {
    if (!creep.memory.sourceId) {
      const potentialSources: Id<Source>[] = [];
      const harvesters = _.filter(Game.creeps, (creep: Harvester) => creep.memory.role == 'harvester');
      const groupedHarvesters = _.groupBy(harvesters, function (n: Harvester) {
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
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        move(creep, source.pos);
      }
      creep.memory.sourceId = source.id;
    } else {
      const source = Game.getObjectById(creep.memory.sourceId);
      if (source) {
        if (source.energy == 0) {
          delete creep.memory.sourceId;
        } else if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          move(creep, source.pos);
        }
      }
    }
  }
};
export default roleHarvester;
