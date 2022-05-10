import {
  BUILDER_SCHEMA,
  CLAIMER_SCHEMA,
  CREEP_SCHEMA,
  FLOATER_SCHEMA,
  HARVESTER_SCHEMA,
  HAULER_SCHEMA,
  REPAIRER_SCHEMA,
  SCOUTER_SCHEMA,
  UPGRADER_SCHEMA,
  WALLER_SCHEMA
} from './constants';

function spawnCreeps(spawnName: string): void {
  const schemaNumber = schemaLevel(spawnName);
  const homeRoomName = Game.spawns[spawnName].room.name;

  const floaters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'floater');
  console.log(`Floaters: ${floaters.length}`);

  const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');
  console.log(`Harvesters: ${harvesters.length}`);

  const wallers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'waller');
  console.log(`Wallers: ${wallers.length}`);

  const upgraders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'upgrader');
  console.log(`Upgraders: ${upgraders.length}`);

  const builders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'builder');
  console.log(`Builders:  ${builders.length}`);

  const repairers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'repairer');
  console.log(`repairer: ${repairers.length}`);

  const haulers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'hauler');
  console.log(`haulers: ${haulers.length}`);

  /*
  const claimers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'claimer');
  console.log(`claimers: ${claimers.length}`);

  const scouters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'scouter');
  console.log(`scouters: ${claimers.length}`);
  */

  /*
  if (scouters.length < 1) {
    const newName = `Scouter_${0} ${Game.time}`;
    console.log('Spawning new Scouter: ' + newName);
    Game.spawns[spawnName].spawnCreep(SCOUTER_SCHEMA[0], newName, {
      memory: { role: 'scouter', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (claimers.length < 1) {
    const newName = `Claimer_${0} ${Game.time}`;
    console.log('Spawning new Claimer: ' + newName);
    Game.spawns[spawnName].spawnCreep(CLAIMER_SCHEMA[0], newName, {
      memory: { role: 'claimer', homeroom: homeRoomName, isRemote: false }
    });
  }
  */

  if (upgraders.length < 2) {
    const newName = `Upgrader_${schemaNumber} ${Game.time}`;
    console.log('Spawning new upgrader: ' + newName);
    Game.spawns[spawnName].spawnCreep(UPGRADER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'upgrader', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (builders.length < 2) {
    const newName = `Builder_${schemaNumber} ${Game.time}`;
    console.log('Spawning new builder: ' + newName);
    Game.spawns[spawnName].spawnCreep(BUILDER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'builder', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (haulers.length < Game.spawns[spawnName].room.find(FIND_SOURCES).length) {
    const newName = `Hauler${schemaNumber} ${Game.time}`;
    console.log('Spawning new Hauler: ' + newName);
    Game.spawns[spawnName].spawnCreep(HAULER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'hauler', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (wallers.length < 1) {
    const newName = `Waller_${schemaNumber} ${Game.time}`;
    console.log('Spawning new Waller: ' + newName);
    Game.spawns[spawnName].spawnCreep(WALLER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'waller', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (repairers.length < 2) {
    const newName = `Repairer_${schemaNumber} ${Game.time}`;
    console.log('Spawning new Repairer: ' + newName);
    Game.spawns[spawnName].spawnCreep(REPAIRER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'repairer', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (floaters.length < 3) {
    const newName = `Floater_${schemaNumber} ${Game.time}`;
    console.log('Spawning new floater: ' + newName);
    Game.spawns[spawnName].spawnCreep(FLOATER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'floater', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (harvesters.length < Game.spawns[spawnName].room.find(FIND_SOURCES).length) {
    const newName = `Harvester_${schemaNumber} ${Game.time}`;
    console.log('Spawning new harvester: ' + newName);
    Game.spawns[spawnName].spawnCreep(HARVESTER_SCHEMA[schemaNumber], newName, {
      memory: { role: 'harvester', homeroom: homeRoomName, isRemote: false }
    });
  }

  if (Game.spawns[spawnName].spawning) {
    const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning!.name];
    Game.spawns[spawnName].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns[spawnName].pos.x + 1,
      Game.spawns[spawnName].pos.y,
      { align: 'left', opacity: 0.8 }
    );
  }
}

function schemaLevel(spawnName: string): number {
  const energyCapacityAvailable = Game.spawns[spawnName].room.energyCapacityAvailable;
  const energyAvailable = Game.spawns[spawnName].room.energyAvailable;
  let schemaNumber = 0;

  if (energyCapacityAvailable >= 800 && energyAvailable >= 650) {
    schemaNumber = 2;
  } else if (energyCapacityAvailable >= 500 && energyAvailable >= 400) {
    schemaNumber = 1;
  }
  return schemaNumber;
}

function spawnFromQuota(
  spawnName: string,
  quotaList: Record<string, number>[],
  isRemoteCreeps: boolean,
  targetRoom?: string
): void {
  const schemaNumber = schemaLevel(spawnName);
  console.log();
  const homeRoomName = Game.spawns[spawnName].room.name;
  console.log(JSON.stringify(quotaList));
  for (const [role, quota] of Object.entries(quotaList)) {
    console.log(`role is: ${role}`);
    console.log(`quota is: ${JSON.stringify(quota)}`);
    const numberOfCreep = _.filter(
      Game.creeps,
      (creep: Creep) => creep.memory.role == role && creep.memory.targetRoom == targetRoom
    );
    console.log(`${role}s: ${numberOfCreep.length}`);

    if (numberOfCreep.length < quota.number) {
      const newName = `${role}_${schemaNumber} ${Game.time}`;
      if (isRemoteCreeps) {
        Game.spawns[spawnName].spawnCreep(CREEP_SCHEMA[role][schemaNumber], newName, {
          memory: { role: role, homeroom: homeRoomName, isRemote: true, targetRoom: targetRoom }
        });
      } else {
        Game.spawns[spawnName].spawnCreep(CREEP_SCHEMA[role][schemaNumber], newName, {
          memory: { role: role, homeroom: homeRoomName, isRemote: false }
        });
      }
    }
  }
  if (Game.spawns[spawnName].spawning) {
    const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning!.name];
    Game.spawns[spawnName].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns[spawnName].pos.x + 1,
      Game.spawns[spawnName].pos.y,
      { align: 'left', opacity: 0.8 }
    );
  }
}

export { spawnCreeps, schemaLevel, spawnFromQuota };
