import roleBuilder, { Builder } from 'roles/builder';
import roleHarvester from 'roles/harvester';
import roleUpgrader, { Upgrader } from 'roles/upgrader';
import roleRepairer, { Repairer } from 'roles/repairer';
import ErrorMapper from 'utils/ErrorMapper';
import { runTower } from './tower';
import { spawnCreeps } from './spawning';
import { storeSourcesInMemory} from './roomCatalog'

declare global {
  interface CreepMemory {
    role: string;
  }
}

function unwrappedLoop(): void {
  console.log(`Current game tick is ${Game.time}`);

  Object.values(Game.rooms).forEach(room => {
    if (room.controller?.my) {
      const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

      towers.forEach(tower => {
        runTower(tower);
      });
    }
  });

  //Spawning
  spawnCreeps()


  //Catalog Room

  Object.values(Game.rooms).forEach(room => {
    if (room.controller?.my) {
      storeSourcesInMemory(room)
    }
  });


  Object.values(Game.creeps).forEach(creep => {
    if (creep.memory.role === 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role === 'upgrader') {
      roleUpgrader.run(creep as Upgrader);
    }
    if (creep.memory.role === 'builder') {
      roleBuilder.run(creep as Builder);
    }
    if (creep.memory.role === 'repairer') {
      roleRepairer.run(creep as Repairer);
    }
    if (creep.memory.role === 'floater'){
      if(creep.room.energyAvailable < creep.room.energyCapacityAvailable){
        roleHarvester.run(creep)
      } else if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length != 0){
        roleBuilder.run(creep as Builder)
      } else{
        roleUpgrader.run(creep as Upgrader)
      }
    }
  });

  // Automatically delete memory of missing creeps
  Object.keys(Memory.creeps)
    .filter(name => !(name in Game.creeps))
    .forEach(name => delete Memory.creeps[name]);
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
const loop = ErrorMapper.wrapLoop(unwrappedLoop);

export {
  loop,
  unwrappedLoop
};
