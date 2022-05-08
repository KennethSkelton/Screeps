import { HARVESTER_SCHEMA } from './constants';


function spawnCreeps(spawnName: string): void {
    const energyCapacityAvailable = Game.spawns[spawnName].room.energyCapacityAvailable
    let schemaNumber = 1
    if(energyCapacityAvailable >= 550){
        schemaNumber = 2
    }

    const floaters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'floater');
    console.log(`Floaters: ${floaters.length}`);

    const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');
    console.log(`Harvesters: ${harvesters.length}`);

    const superHarvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'superHarvester');
    console.log(`superHarvester: ${superHarvesters.length}`);

    const upgraders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'upgrader');
    console.log(`Upgraders: ${upgraders.length}`);

    const builders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'builder');
    console.log(`Builders:  ${builders.length}`);

    const superBuilders = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'superBuilder');
    console.log(`superBuilders: ${superBuilders.length}`);

    const repairers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'repairer');
    console.log(`repairer: ${repairers.length}`);


    if(upgraders.length < 2) {
        const newName = `Upgrader ${Game.time}`;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns[spawnName].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }

    if(builders.length < 3) {
        const newName = `Builder ${Game.time}`;
        console.log('Spawning new builder: ' + newName);
        Game.spawns[spawnName].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});
    }

    if(repairers.length < 2) {
        const newName = `Repairer ${Game.time}`;
        console.log('Spawning new Repairer: ' + newName);
        Game.spawns[spawnName].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'repairer'}});
    }

    if(floaters.length < 6) {
        const newName = `Floater ${Game.time}`;
        console.log('Spawning new floater: ' + newName);
        Game.spawns[spawnName].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'floater'}});
    }

    if(harvesters.length < 7) {
        const newName = `Harvester ${Game.time}`;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns[spawnName].spawnCreep(HARVESTER_SCHEMA[schemaNumber as keyof HARVESTER_SCHEMA], newName,
            {memory: {role: 'harvester'}});
    }

    if(Game.spawns[spawnName].spawning) {
        const spawningCreep = Game.creeps[Game.spawns[spawnName].spawning!.name];
        Game.spawns[spawnName].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns[spawnName].pos.x + 1,
            Game.spawns[spawnName].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

export {spawnCreeps};

