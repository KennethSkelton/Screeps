import ErrorMapper from 'utils/ErrorMapper';
import { runTower } from './tower';
import { spawnCreeps } from './spawning';
import { storeSourcesInMemory } from './roomCatalog';
import { HOME_ROOM, HOME_SPAWN, REMOTE_OPERATIONS_LIST } from './constants';
import { assignJobs } from 'taskAssignment';
import { remoteOperations } from 'remoteOperations';
import profiler from 'screeps-profiler';
import { findSellOrder } from 'functions';

declare global {
  interface CreepMemory {
    role: string;
    homeroom: string;
    target?: string;
    isRemote: boolean;
    targetRoom?: string;
  }
}

// eslint-disable-next-line
profiler.enable();

function main(): void {
  console.log(`Current game tick is ${Game.time}`);

  if (Game.spawns['Spawn1'].hits < Game.spawns['Spawn1'].hitsMax) {
    Game.spawns['Spawn1'].room.controller?.activateSafeMode();
  }

  //order
  const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: RESOURCE_ENERGY });
  const terminals = Game.rooms[HOME_ROOM].find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TERMINAL } });
  if (terminals.length > 0) {
    const terminal = terminals[0];
    if (terminal instanceof StructureTerminal) {
      const order = Game.market.getOrderById(findSellOrder(orders, terminal, 9.5, RESOURCE_ENERGY));
      if (order) {
        console.log(`Order status is: ${Game.market.deal(order.id, order.amount, terminal.room.name)}`);
      }
    }
  }

  Object.values(Game.rooms).forEach((room) => {
    if (room.controller?.my) {
      const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

      towers.forEach((tower) => {
        runTower(tower);
      });
    }
  });

  //Spawning
  spawnCreeps('Spawn1');
  spawnCreeps('Spawn2');

  //Catalog Room
  Object.values(Game.rooms).forEach((room) => {
    storeSourcesInMemory(room);
  });

  //Handle remote operations
  remoteOperations('Spawn1', REMOTE_OPERATIONS_LIST);

  //Job Assignment
  assignJobs();

  //emergency return to base
  Object.values(Game.creeps).forEach((creep) => {
    if (!creep.memory.isRemote && creep.pos.roomName != creep.memory.homeroom) {
      creep.moveTo(Game.flags['HOME_FLAG'].pos, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  });

  // Automatically delete memory of missing creeps
  Object.keys(Memory.creeps)
    .filter((name) => !(name in Game.creeps))
    .forEach((name) => delete Memory.creeps[name]);
}

function unwrappedLoop(): void {
  // eslint-disable-next-line
  profiler.wrap(() => {
    main();
  });
}
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export { loop, unwrappedLoop };
