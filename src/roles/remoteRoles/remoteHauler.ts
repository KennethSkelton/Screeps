import { FILL_PRIORITY } from '../../constants';

export interface remoteHauler extends Creep {
  memory: remoteHaulerMemory;
}

interface remoteHaulerMemory extends CreepMemory {
  role: 'hauler';
  depositing: boolean;
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleRemoteHauler = {
  run(creep: remoteHauler): void {
    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.depositing = true;
    } else if (creep.store.getUsedCapacity() == 0) {
      creep.memory.depositing = false;
    }
    if (creep.memory.depositing) {
      if (creep.room.name == creep.memory.homeroom) {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target instanceof Structure) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              if (creep.memory.path) {
                creep.move(creep.pos.getDirectionTo(creep.memory.path[0]));
                creep.room.visual.poly(creep.memory.path);
                creep.memory.path.shift();
                creep.memory.path = creep.memory.path;
              } else {
                creep.memory.path = PathFinder.search(creep.pos, target.pos).path;
              }
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
      } else {
        const route = Game.map.findRoute(creep.room, creep.memory.homeroom);
        if (route != ERR_NO_PATH && route.length > 0) {
          console.log('Now heading to room ' + route[0].room);
          const exit = creep.pos.findClosestByRange(route[0].exit);
          if (exit) {
            creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    } else {
      if (creep.room.name == creep.memory.targetRoom) {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target) {
            if (target instanceof Resource) {
              if (creep.memory.targetRoom == creep.room.name) {
                if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
                }
              }
            } else if (target instanceof Structure) {
              if (target.room.name == creep.room.name) {
                if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                  if (creep.memory.path) {
                    creep.move(creep.pos.getDirectionTo(creep.memory.path[0]));
                    creep.room.visual.poly(creep.memory.path);
                    creep.memory.path.shift();
                    creep.memory.path = creep.memory.path;
                  } else {
                    creep.memory.path = PathFinder.search(creep.pos, target.pos).path;
                  }
                }
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
            if (droppedResources.length > 0) {
              const target = creep.pos.findClosestByPath(droppedResources);
              if (target) {
                delete creep.memory.path;
                creep.memory.target = target.id;
              }
            } else {
              const containers = creep.room.find(FIND_STRUCTURES, { filter: hasEnergy });
              const target = creep.pos.findClosestByPath(containers);
              if (target) {
                delete creep.memory.path;
                creep.memory.target = target.id;
              }
            }
          }
        }
      } else {
        const route = Game.map.findRoute(creep.room, creep.memory.targetRoom!);
        if (route != ERR_NO_PATH && route.length > 0) {
          console.log('Now heading to room ' + route[0].room);
          const exit = creep.pos.findClosestByRange(route[0].exit);
          if (exit) {
            creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    }
  }
};

function hasEnergy(structure: Structure): boolean {
  if (
    structure.structureType === STRUCTURE_EXTENSION ||
    structure.structureType === STRUCTURE_SPAWN ||
    structure.structureType === STRUCTURE_TOWER ||
    structure.structureType === STRUCTURE_CONTAINER ||
    structure.structureType === STRUCTURE_STORAGE
  ) {
    // eslint-disable-next-line max-len
    const s = structure as StructureExtension | StructureSpawn | StructureTower | StructureContainer | StructureStorage;
    if (s instanceof StructureContainer || s instanceof StructureStorage) {
      return s.store.getUsedCapacity() > 0;
    } else {
      return s.energy > 0;
    }
  }
  return false;
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

export default roleRemoteHauler;
