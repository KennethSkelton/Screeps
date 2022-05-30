import { move, moveToRoom } from 'functions';

export interface ColonyBuilder extends Creep {
  memory: ColonyBuilderMemory;
}

interface ColonyBuilderMemory extends CreepMemory {
  building: boolean;
  role: 'colonyBuilder';
  target?: Id<_HasId>;
  path?: RoomPosition[];
}

const roleColonyBuilder = {
  run(creep: ColonyBuilder): void {
    if (creep.room.name != creep.memory.targetRoom) {
      moveToRoom(creep);
    } else {
      //work
      if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        delete creep.memory.target;
        delete creep.memory.path;
        creep.say('🔄 harvest');
      }
      if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
        delete creep.memory.target;
        delete creep.memory.path;
        creep.say('🚧 build');
      }
      if (creep.memory.building) {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target instanceof ConstructionSite) {
            const buildResult = creep.build(target);
            if (buildResult === ERR_NOT_IN_RANGE) {
              move(creep, target.pos);
            } else if (buildResult != OK) {
              delete creep.memory.target;
              delete creep.memory.path;
            }
          } else if (target instanceof Spawn) {
            const transferResult = creep.transfer(target, RESOURCE_ENERGY);
            if (transferResult == ERR_NOT_IN_RANGE) {
              move(creep, target.pos);
            } else if (transferResult == ERR_FULL) {
              creep.drop(RESOURCE_ENERGY);
            } else {
              delete creep.memory.target;
              delete creep.memory.path;
            }
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
          const target = creep.pos.findClosestByPath(targets);
          if (target) {
            delete creep.memory.path;
            creep.memory.target = target.id;
            move(creep, target.pos);
          } else {
            const sourceTargets = creep.room.find(FIND_MY_SPAWNS);
            const sourceTarget = creep.pos.findClosestByPath(sourceTargets);
            if (sourceTarget) {
              delete creep.memory.path;
              creep.memory.target = sourceTarget.id;
              move(creep, sourceTarget.pos);
            }
          }
        }
      } else {
        if (creep.memory.target) {
          const target = Game.getObjectById(creep.memory.target);
          if (target instanceof Source) {
            const harvestResult = creep.harvest(target);
            if (harvestResult === ERR_NOT_IN_RANGE) {
              move(creep, target.pos);
            } else if (harvestResult != OK) {
              delete creep.memory.target;
              delete creep.memory.path;
            }
          } else {
            delete creep.memory.target;
            delete creep.memory.path;
          }
        } else {
          const targets = creep.room.find(FIND_SOURCES);
          const target = creep.pos.findClosestByPath(targets);
          if (target) {
            delete creep.memory.path;
            creep.memory.target = target.id;
            move(creep, target.pos);
          }
        }
      }
    }
  }
};

export default roleColonyBuilder;
