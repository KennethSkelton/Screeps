import { HOME_SPAWN } from '../constants';
import { RETRIEVE_PRIORITY } from '../constants';

export interface Upgrader extends Creep {
  memory: UpgraderMemory;
}

interface UpgraderMemory extends CreepMemory {
  role: 'upgrader';
  upgrading: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleUpgrader = {
  run(creep: Upgrader): void {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
      delete creep.memory.target;
      delete creep.memory.path;
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
      delete creep.memory.target;
      delete creep.memory.path;
    }

    if (creep.memory.upgrading) {
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          move(creep, creep.room.controller);
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            move(creep, target);
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else if (target instanceof Resource) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          delete creep.memory.target;
          delete creep.memory.path;
        }
      }
      const targets = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
      if (targets.length > 0) {
        const groupedTargets = _.groupBy(targets, function (n) {
          return n.structureType;
        });
        for (const type of RETRIEVE_PRIORITY) {
          if (groupedTargets[type]) {
            const target = creep.pos.findClosestByPath(groupedTargets[type]);
            if (target) {
              delete creep.memory.path;
              creep.memory.target = target.id;
              break;
            }
          }
        }
      } else {
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
        const droppedResource = creep.pos.findClosestByPath(droppedResources);
        if (droppedResource) {
          delete creep.memory.path;
          creep.memory.target = droppedResource.id;
        }
      }
    }
  }
};

function move(creep: Upgrader, target: RoomObject) {
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
    creep.memory.path = PathFinder.search(creep.pos, target.pos, {
      // We need to set the defaults costs higher so that we
      // can set the road cost lower in `roomCallback`
      plainCost: 2,
      swampCost: 10,
      roomCallback: function (roomName) {
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
              costs.set(x, y, 20);
            }
          }
        }

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
    }).path;
    creep.room.visual.poly(creep.memory.path, {
      stroke: '#fff',
      strokeWidth: 0.15,
      opacity: 0.2,
      lineStyle: 'dashed'
    });
  }
}

function hasEnergy(structure: Structure): boolean {
  if (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) {
    // eslint-disable-next-line max-len
    const s = structure as StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getUsedCapacity() > 0;
    }
  }
  return false;
}

export default roleUpgrader;
