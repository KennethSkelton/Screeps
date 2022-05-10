import ErrorMapper from 'utils/ErrorMapper';
import { runTower } from './tower';
import { spawnCreeps } from './spawning';
import { storeSourcesInMemory } from './roomCatalog';
import { HOME_ROOM, HOME_SPAWN, REMOTE_OPERATIONS_LIST } from './constants';
import { assignJobs } from 'taskAssignment';
import { remoteOperations } from 'remoteOperations';

declare global {
  interface CreepMemory {
    role: string;
    homeroom: string;
    target?: string;
    isRemote: boolean;
    targetRoom?: string;
  }
}

function unwrappedLoop(): void {
  console.log(`Current game tick is ${Game.time}`);

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

  //Catalog Room
  Object.values(Game.rooms).forEach((room) => {
    if (room.controller?.my || room.controller?.reservation?.username === Game.spawns[HOME_SPAWN].owner.username) {
      storeSourcesInMemory(room);
    }
  });

  //Job Assignment
  assignJobs();

  //Handle remote operations
  remoteOperations('Spawn1', REMOTE_OPERATIONS_LIST);

  //emergency return to base
  Object.values(Game.creeps).forEach((creep) => {
    if (!creep.memory.isRemote && creep.pos.roomName != HOME_ROOM) {
      creep.moveTo(Game.flags['HOME_FLAG'].pos, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  });

  // Automatically delete memory of missing creeps
  Object.keys(Memory.creeps)
    .filter((name) => !(name in Game.creeps))
    .forEach((name) => delete Memory.creeps[name]);
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export { loop, unwrappedLoop };
