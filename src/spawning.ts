import {
  BUILDER_SCHEMA,
  CLAIMER_SCHEMA,
  FLOATER_SCHEMA,
  HARVESTER_SCHEMA,
  HAULER_SCHEMA,
  UPGRADER_SCHEMA
} from './constants';

function spawnCreeps(spawnName: string): void {
  const schemaNumber = schemaLevel(spawnName);

  const floaters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'floater');
  console.log(`Floaters: ${floaters.length}`);

  const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');
  console.log(`Harvesters: ${harvesters.length}`);

  const upgraders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'upgrader');
  console.log(`Upgraders: ${upgraders.length}`);

  const builders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'builder');
  console.log(`Builders:  ${builders.length}`);

  const repairers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'repairer');
  console.log(`repairer: ${repairers.length}`);

  const haulers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'hauler');
  console.log(`hauler: ${haulers.length}`);

  const claimers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'claimer');
  console.log(`hauler: ${claimers.length}`);

  if (claimers.length < 1) {
    const newName = `Claimer_${0} ${Game.time}`;
    console.log('Spawning new Claimer: ' + newName);
    Game.spawns[spawnName].spawnCreep(CLAIMER_SCHEMA[schemaNumber], newName, { memory: { role: 'claimer' } });
  }

  if (upgraders.length < 2) {
    const newName = `Upgrader_${schemaNumber} ${Game.time}`;
    console.log('Spawning new upgrader: ' + newName);
    Game.spawns[spawnName].spawnCreep(UPGRADER_SCHEMA[schemaNumber], newName, { memory: { role: 'upgrader' } });
  }

  if (builders.length < 2) {
    const newName = `Builder_${schemaNumber} ${Game.time}`;
    console.log('Spawning new builder: ' + newName);
    Game.spawns[spawnName].spawnCreep(BUILDER_SCHEMA[schemaNumber], newName, { memory: { role: 'builder' } });
  }

  if (haulers.length < 2) {
    const newName = `Hauler${schemaNumber} ${Game.time}`;
    console.log('Spawning new Hauler: ' + newName);
    Game.spawns[spawnName].spawnCreep(HAULER_SCHEMA[schemaNumber], newName, { memory: { role: 'hauler' } });
  }

  if (repairers.length < 2) {
    const newName = `Repairer_${schemaNumber} ${Game.time}`;
    console.log('Spawning new Repairer: ' + newName);
    Game.spawns[spawnName].spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: 'repairer' } });
  }

  if (floaters.length < 3) {
    const newName = `Floater_${schemaNumber} ${Game.time}`;
    console.log('Spawning new floater: ' + newName);
    Game.spawns[spawnName].spawnCreep(FLOATER_SCHEMA[schemaNumber], newName, { memory: { role: 'floater' } });
  }

  if (harvesters.length < Game.spawns[spawnName].room.find(FIND_SOURCES).length) {
    const newName = `Harvester_${schemaNumber} ${Game.time}`;
    console.log('Spawning new harvester: ' + newName);
    Game.spawns[spawnName].spawnCreep(HARVESTER_SCHEMA[schemaNumber], newName, { memory: { role: 'harvester' } });
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

export { spawnCreeps, schemaLevel };
