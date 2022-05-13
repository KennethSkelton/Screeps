import { Builder } from 'roles/builder';
import { Hauler } from 'roles/hauler';
import { Upgrader } from 'roles/upgrader';

function createCostMatrix(roomName: string) {
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
  return costs;
}

function move(creep: Builder | Upgrader | Hauler, target: RoomObject): void {
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
      { pos: target.pos, range: 1 },
      {
        // We need to set the defaults costs higher so that we
        // can set the road cost lower in `roomCallback`
        plainCost: 2,
        swampCost: 10,
        roomCallback: function () {
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

export { createCostMatrix, move };
