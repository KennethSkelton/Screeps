import profiler from 'screeps-profiler';
import { Builder } from 'roles/builder';
import { Claimer } from 'roles/remoteRoles/claimer';
import { Stunner } from 'roles/combatRoles/stunner';
import { Harvester } from 'roles/harvester';
import { Hauler } from 'roles/hauler';
import { RemoteBuilder } from 'roles/remoteRoles/remoteBuilder';
import { RemoteHarvester } from 'roles/remoteRoles/remoteHarvester';
import { RemoteHauler } from 'roles/remoteRoles/remoteHauler';
import { Repairer } from 'roles/repairer';
import { Scouter } from 'roles/remoteRoles/scouter';
import { Upgrader } from 'roles/upgrader';
import { Waller } from 'roles/waller';
import { ColonyBuilder } from 'roles/remoteRoles/colonyBuilder';

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
    if (site.structureType != STRUCTURE_ROAD) {
      costs.set(site.pos.x, site.pos.y, 0xfe);
    }
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
    | Stunner
    | ColonyBuilder,
  target: RoomPosition,
  range?: number
): void {
  if (creep.memory.path && creep.memory.path.length > 0) {
    if (creep.fatigue == 0) {
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
          creep.room.visual.poly(creep.memory.path, {
            stroke: '#fff',
            strokeWidth: 0.15,
            opacity: 0.2,
            lineStyle: 'dashed'
          });
          creep.memory.path = newPath;
        }
      }
    } else {
      creep.room.visual.poly(creep.memory.path, {
        stroke: '#fff',
        strokeWidth: 0.15,
        opacity: 0.2,
        lineStyle: 'dashed'
      });
    }
  } else {
    let givenRange;
    if (!range) {
      givenRange = 1;
    } else {
      givenRange = range;
    }
    creep.memory.path = PathFinder.search(
      creep.pos,
      { pos: target, range: givenRange },
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

function moveToRoom(creep: Creep, roomname?: string): void {
  let targetRoom = creep.memory.targetRoom;
  if (roomname) {
    targetRoom = roomname;
  }
  if (targetRoom) {
    const route = Game.map.findRoute(creep.room, targetRoom);
    if (route != ERR_NO_PATH && route.length > 0) {
      console.log('Now heading to room ' + route[0].room);
      const exit = creep.pos.findClosestByRange(route[0].exit);
      if (exit) {
        creep.moveTo(exit, {
          visualizePathStyle: {
            stroke: '#fff',
            strokeWidth: 0.15,
            opacity: 0.2,
            lineStyle: 'dashed'
          }
        });
      }
    }
  }
}
/*
const WORLD_RESOURCES: string[] = [
  RESOURCE_CATALYST,
  RESOURCE_HYDROGEN,
  RESOURCE_OXYGEN,
  RESOURCE_LEMERGIUM,
  RESOURCE_UTRIUM,
  RESOURCE_ZYNTHIUM,
  RESOURCE_KEANIUM,
  RESOURCE_ENERGY,
  RESOURCE_MIST,
  RESOURCE_METAL,
  RESOURCE_BIOMASS,
  RESOURCE_SILICON
];

interface cost {
  name: string;
  amount: number;
}

interface totalCost {
  costs: cost[],
  time: number
}

function checkIfArraysAreNotEachOther(array: cost[]): boolean {
  for (let i = 0; i < array.length; i++) {
    let flag = true;
    for (let j = 0; j < WORLD_RESOURCES.length; j++) {
      if (array[i].name == WORLD_RESOURCES[j]) {
        flag = false;
      }
    }
    if (flag) {
      return false;
    }
  }
  return true;
}

function calculateCost(thing: CommodityConstant, amount: number): totalCost {
  let costs = [{ name: thing, amount: amount}];
  let runningTimeTotal
  while (checkIfArraysAreNotEachOther(costs)) {
    costs.forEach((element) => {
      if (!WORLD_RESOURCES.includes(element.name)) {
        const replaceIndex = costs.indexOf(element);
        costs.splice(replaceIndex, 1)

        const components = COMMODITIES[element.name].components;
        const keys = Object.keys(components);
        const values = Object.values(components);

        for (let i = 0; i < keys.length; i++) {
          costs.splice(replaceIndex, 0, {name: keys[i], amount: values[i]})
        }

        costs[costs.indexOf(element)];
      }
    });
  }
}*/

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

profiler.registerFN(createCostMatrix, 'CostMatrix');
profiler.registerFN(move, 'MyMove');
profiler.registerFN(moveToRoom, 'moveToRoom');

export { createCostMatrix, move, moveToRoom, hasEnergy };
