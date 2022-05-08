function spawnCreeps(): void {
    const floaters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'floaters');
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



    if(harvesters.length < 4) {
        const newName = `Harvester ${Game.time}`;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
    }

    if(superHarvesters.length < 0) {
        const newName = `SuperHarvester ${Game.time}`;
        console.log('Spawning new SuperHarvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName,
            {memory: {role: 'superHarvester'}});
    }

    if(upgraders.length < 2) {
        const newName = `Upgrader ${Game.time}`;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }

    if(builders.length < 3) {
        const newName = `Builder ${Game.time}`;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});
    }

    if(superBuilders.length < 0) {
        const newName = `SuperBuilder ${Game.time}`;
        console.log('Spawning new SuperBuilder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], newName,
            {memory: {role: 'superBuilder'}});
    }

    if(repairers.length < 0) {
        const newName = `Repairer' ${Game.time}`;
        console.log('Spawning new Repairer: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'repairer'}});
    }

    if(floaters.length < 6) {
        const newName = `Floater' ${Game.time}`;
        console.log('Spawning new Floater: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'Floater'}});
    }

    if(Game.spawns['Spawn1'].spawning) {
        const spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

export {spawnCreeps};

