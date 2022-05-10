//harvester creeps
const HARVESTER_SCHEMA = [
  [WORK, WORK, MOVE],
  [WORK, WORK, MOVE],
  [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE]
];

//upgrader creeps
const UPGRADER_SCHEMA = [
  [WORK, CARRY, MOVE],
  [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
  [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
];

//builder creeps
const BUILDER_SCHEMA = [
  [WORK, CARRY, MOVE],
  [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
  [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
];
//repairer creeps
const REPAIRER_SCHEMA = [
  [WORK, CARRY, MOVE],
  [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
  [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
];

const WALLER_SCHEMA = [
  [WORK, CARRY, MOVE],
  [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
  [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
];
//floater creeps
const FLOATER_SCHEMA = [
  [WORK, CARRY, MOVE],
  [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
  [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
];

//hauler creeps
const HAULER_SCHEMA = [
  [CARRY, CARRY, MOVE, MOVE],
  [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
  [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
];

//runner creeps
const RUNNER_SCHEMA = [
  [CARRY, MOVE],
  [CARRY, MOVE],
  [CARRY, MOVE]
];

//claimer creeps
const CLAIMER_SCHEMA = [
  [CLAIM, MOVE, MOVE],
  [CLAIM, MOVE, MOVE],
  [CLAIM, MOVE, MOVE]
];

//scouter creeps
const SCOUTER_SCHEMA = [
  [MOVE, MOVE],
  [MOVE, MOVE],
  [MOVE, MOVE]
];

const CREEP_SCHEMA: Record<string, Array<Array<BodyPartConstant>>> = {
  harvester: HARVESTER_SCHEMA,
  upgrader: UPGRADER_SCHEMA,
  builder: BUILDER_SCHEMA,
  repairer: REPAIRER_SCHEMA,
  waller: WALLER_SCHEMA,
  floater: FLOATER_SCHEMA,
  hauler: HAULER_SCHEMA,
  runner: RUNNER_SCHEMA,
  claimer: CLAIMER_SCHEMA,
  scouter: SCOUTER_SCHEMA,

  //remote varients
  remoteHarvester: HARVESTER_SCHEMA,
  remoteBuilder: BUILDER_SCHEMA,
  remoteHauler: HAULER_SCHEMA
};

const HOME_ROOM = 'W12N56';
const HOME_SPAWN = 'Spawn1';

const FILL_PRIORITY = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
const RETRIEVE_PRIORITY = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];

const REMOTE_OPERATIONS_LIST = [{ roomName: 'W11N56', type: 'remoteMine' }];

export {
  HARVESTER_SCHEMA,
  UPGRADER_SCHEMA,
  BUILDER_SCHEMA,
  REPAIRER_SCHEMA,
  WALLER_SCHEMA,
  FLOATER_SCHEMA,
  HAULER_SCHEMA,
  RUNNER_SCHEMA,
  CLAIMER_SCHEMA,
  SCOUTER_SCHEMA,
  CREEP_SCHEMA,
  HOME_ROOM,
  HOME_SPAWN,
  FILL_PRIORITY,
  RETRIEVE_PRIORITY,
  REMOTE_OPERATIONS_LIST
};
