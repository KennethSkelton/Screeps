import { FILL_PRIORITY, HOME_SPAWN } from '../constants';

export interface Hauler extends Creep {
  memory: HaulerMemory;
}

interface HaulerMemory extends CreepMemory {
  role: 'hauler';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleHauler = {
  run(creep: Hauler): void {
    if (creep.store.getUsedCapacity() == 0) {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Resource) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            move(creep, target);
          }
        } else {
          delete creep.memory.target;
        }
      } else {
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: function (object: Resource) {
            return object.amount >= 50;
          }
        });
        const target = creep.pos.findClosestByPath(droppedResources);
        if (target) {
          delete creep.memory.path;
          creep.memory.target = target.id;
        }
      }
    } else {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target);
        if (target instanceof Structure) {
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            move(creep, target);
          }
        } else {
          delete creep.memory.target;
        }
      } else {
        const targets = creep.room.find(FIND_STRUCTURES, { filter: isToBeFilled });
        if (targets.length > 0) {
          const groupedTargets = _.groupBy(targets, function (n) {
            return n.structureType;
          });

          for (const type of FILL_PRIORITY) {
            if (groupedTargets[type]) {
              const target = creep.pos.findClosestByPath(groupedTargets[type]);
              if (target) {
                delete creep.memory.path;
                creep.memory.target = target.id;
              }
            }
          }
        }
      }
    }
  }
};
function move(creep: Hauler, target: RoomObject) {
  if (creep.memory.path) {
    if (creep.pos != creep.memory.path[0]) {
      const path = creep.memory.path;
      const pathStep = path.shift();
      if (pathStep) {
        creep.move(creep.pos.getDirectionTo(pathStep.x, pathStep.y));
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
  }
}

function isToBeFilled(structure: Structure): boolean {
  if (
    structure.structureType === STRUCTURE_EXTENSION ||
    structure.structureType === STRUCTURE_SPAWN ||
    structure.structureType === STRUCTURE_TOWER ||
    structure.structureType === STRUCTURE_CONTAINER ||
    structure.structureType === STRUCTURE_STORAGE
  ) {
    const s = structure as StructureExtension | StructureSpawn | StructureTower | StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getFreeCapacity() > 0;
    } else if (s instanceof StructureTower) {
      return s.store.getFreeCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY) > 0.5;
    } else {
      return s.energy < s.energyCapacity;
    }
  }
  return false;
}

export default roleHauler;
