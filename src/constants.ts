
//harvester creeps
const HARVESTER_SCHEMA = {
    1 : [WORK, CARRY, MOVE],
    2 : [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
}

//upgrader creeps
const UPGRADER_SCHEMA = {
    1 : [WORK, CARRY, MOVE],
    2 : [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
}

const BUILDER_SCHEMA = {
    1 : [WORK, CARRY, MOVE],
    2 : [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
}

const FLOATER_SCHEMA = {
    1 : [WORK, CARRY, MOVE],
    2 : [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
}

