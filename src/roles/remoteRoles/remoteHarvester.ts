import { move } from 'functions';

export interface RemoteHarvester extends Creep {
  memory: RemoteHarvesterMemory;
}

export interface RemoteHarvesterMemory extends CreepMemory {
  role: 'remoteHarvester';
  sourceId?: Id<_HasId>;
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
        const harvesters = _.filter(Game.creeps, (creep: RemoteHarvester) => creep.memory.role == 'remoteHarvester');
        const groupedHarvesters = _.groupBy(harvesters, function (n: RemoteHarvester) {
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
        if (source instanceof Source && source.energy > 0) {
          const error = creep.harvest(source);
          if (error === ERR_NOT_IN_RANGE) {
            move(creep, source.pos);
          } else if (error === OK) {
            creep.room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_CONTAINER);
          }
        } else {
          delete creep.memory.sourceId;
        }
      }
    }
  }
};
export default roleRemoteHarvester;
