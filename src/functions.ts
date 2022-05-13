import { Builder } from 'roles/builder';
import { Claimer } from 'roles/claimer';
import { Stunner } from 'roles/combatRoles/stunner';
import { Harvester } from 'roles/harvester';
import { Hauler } from 'roles/hauler';
import { RemoteBuilder } from 'roles/remoteRoles/remoteBuilder';
import { RemoteHarvester } from 'roles/remoteRoles/remoteHarvester';
import { RemoteHauler } from 'roles/remoteRoles/remoteHauler';
import { Repairer } from 'roles/repairer';
import { Scouter } from 'roles/scouter';
import { Upgrader } from 'roles/upgrader';
import { Waller } from 'roles/waller';
import profiler from 'screeps-profiler';

declare global {
  interface RoomMemory {
    matrix: number[];
  }
}

function createCostMatrix(roomName: string): CostMatrix | boolean {
  const room = Game.rooms[roomName];
  // In this example `room` will always exist, but since
  // PathFinder supports searches which span multiple rooms
  // you should be careful!
  if (!room) return false;
  const costs = new PathFinder.CostMatrix();

  const terrain = room.getTerrain();
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      if (terrain.get(x, y) == 1) {
        costs.set(x, y, 0xff);
      }
    }
  }

  room.find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
    costs.set(site.pos.x, site.pos.y, 0xff);
  });

  room.find(FIND_STRUCTURES).forEach(function (struct) {
    if (struct.structureType === STRUCTURE_ROAD) {
      // Favor roads over plain tiles
      costs.set(struct.pos.x, struct.pos.y, 1);
    } else if (
      struct.structureType !== STRUCTURE_CONTAINER &&
      (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
    ) {
      // Can't walk through non-walkable buildings
      costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
  });

  // Avoid creeps in the room
  room.find(FIND_CREEPS).forEach(function (creep) {
    costs.set(creep.pos.x, creep.pos.y, 0xff);
  });
  Memory.rooms[roomName].matrix = costs.serialize();
  return costs;
}

function move(
  creep:
    | Builder
    | Upgrader
    | Hauler
    | Repairer
    | Waller
    | Scouter
    | Claimer
    | RemoteHauler
    | RemoteBuilder
    | Harvester
    | RemoteHarvester
    | Stunner,
  target: RoomPosition
): void {
  if (creep.memory.path && creep.memory.path.length > 0) {
    creep.room.visual.poly(creep.memory.path, {
      stroke: '#fff',
      strokeWidth: 0.15,
      opacity: 0.2,
      lineStyle: 'dashed'
    });
    if (creep.pos != creep.memory.path[0]) {
      const path = creep.memory.path;
      const pathStep = path.shift();
      if (pathStep) {
        creep.move(creep.pos.getDirectionTo(pathStep.x, pathStep.y));
        creep.room.visual.poly(creep.memory.path, {
          stroke: '#fff',
          strokeWidth: 0.15,
          opacity: 0.2,
          lineStyle: 'dashed'
        });
      }
    } else {
      const path = creep.memory.path;
      path.shift();
      const newPath = path;
      const pathStep = path.shift();
      if (pathStep) {
        creep.move(creep.pos.getDirectionTo(pathStep.x, pathStep.y));
        creep.memory.path = newPath;
      }
    }
  } else {
    creep.memory.path = PathFinder.search(
      creep.pos,
      { pos: target, range: 1 },
      {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,
        roomCallback: function () {
          if (Memory.rooms[creep.room.name].matrix) {
            PathFinder.CostMatrix.deserialize(Memory.rooms[creep.room.name].matrix);
          }
          return createCostMatrix(creep.room.name);
        }
      }
    ).path;

    creep.room.visual.poly(creep.memory.path, {
      stroke: '#fff',
      strokeWidth: 0.15,
      opacity: 0.2,
      lineStyle: 'dashed'
    });
  }
}

function moveToRoom(creep: Creep): void {
  if (creep.memory.targetRoom) {
    const route = Game.map.findRoute(creep.room, creep.memory.targetRoom);
    if (route != ERR_NO_PATH && route.length > 0) {
      console.log('Now heading to room ' + route[0].room);
      const exit = creep.pos.findClosestByRange(route[0].exit);
      if (exit) {
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
}

profiler.registerFN(moveToRoom, 'moveToRoom');
profiler.registerFN(move, 'My Move');
profiler.registerFN(createCostMatrix, 'Cost matrix');

export { createCostMatrix, move, moveToRoom };
