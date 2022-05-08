import roleBuilder, { Builder } from 'roles/builder';
import roleHarvester, { Harvester } from 'roles/harvester';
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


  //Build Tower
  // eslint-disable-next-line max-len
  console.log(Game.rooms['W12N56'].controller?.level)
  console.log(Game.rooms['W12N56'].controller?.level && Game.rooms['W12N56'].controller?.level >= 3)
  console.log(Game.rooms['W12N56'].lookForAt(LOOK_CONSTRUCTION_SITES,25,32).length == 0)

  // eslint-disable-next-line max-len
  if(Game.rooms['W12N56'].controller?.level && Game.rooms['W12N56'].controller?.level >= 3 && Game.rooms['W12N56'].lookForAt(LOOK_CONSTRUCTION_SITES,25,32).length == 0){
    Game.rooms['W12N56'].createConstructionSite(25,32,STRUCTURE_TOWER)
  }

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
      roleHarvester.run(creep as Harvester);
    }
    if (creep.memory.role === 'upgrader') {
      roleUpgrader.run(creep as Upgrader);
    }
    if (creep.memory.role === 'builder') {
      if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length!=0){
        roleBuilder.run(creep as Builder);
      }else{
        roleUpgrader.run(creep as Upgrader)
      }
    }
    if (creep.memory.role === 'repairer') {
      roleRepairer.run(creep as Repairer);
    }
    if (creep.memory.role === 'floater'){
      /*
      if(creep.room.energyAvailable < creep.room.energyCapacityAvailable){
        roleHarvester.run(creep as Harvester)
      } else if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length != 0){
        roleBuilder.run(creep as Builder)
      } else{
        */
        roleUpgrader.run(creep as Upgrader)
      //}
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
