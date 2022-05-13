import { move } from 'functions';
import profiler from 'screeps-profiler';

export interface Harvester extends Creep {
  memory: HarvesterMemory;
}

export interface HarvesterMemory extends CreepMemory {
  role: 'harvester';
  sourceId?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleHarvester = {
  run(creep: Harvester): void {
    if (!creep.memory.sourceId) {
      const harvesters = _.filter(Game.creeps, (creep: Harvester) => creep.memory.role == 'harvester');
      const groupedHarvesters = _.groupBy(harvesters, function (n: Harvester) {
        return n.memory.sourceId;
      });

      delete groupedHarvesters['undefined'];
      if (Memory.rooms[creep.room.name].sources) {
        Memory.rooms[creep.room.name].sources?.forEach(function (source) {
          if (!groupedHarvesters[source.id] || groupedHarvesters[source.id].length < source.workerSpots) {
            creep.memory.sourceId = source.id;
          }
        });
      }
      if (creep.memory.sourceId) {
        const source = Game.getObjectById(creep.memory.sourceId);
        if (source instanceof Source) {
          if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            move(creep, source.pos);
          }
        }
      } else {
        creep.memory.sourceId = creep.room.find(FIND_SOURCES)[0].id;
      }
    } else {
      const source = Game.getObjectById(creep.memory.sourceId);
      if (source instanceof Source) {
        if (source.energy == 0) {
          delete creep.memory.sourceId;
        } else if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          move(creep, source.pos);
        }
      }
    }
  }
};

profiler.registerObject(roleHarvester, 'role.harvester');

export default roleHarvester;
