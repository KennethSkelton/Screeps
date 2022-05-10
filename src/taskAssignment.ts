import roleBuilder, { Builder } from 'roles/builder';
import roleHarvester, { Harvester } from 'roles/harvester';
import roleUpgrader, { Upgrader } from 'roles/upgrader';
import roleRepairer, { Repairer } from 'roles/repairer';
import roleHauler, { Hauler } from 'roles/hauler';
import roleClaimer, { Claimer } from 'roles/claimer';
import roleScouter, { Scouter } from 'roles/scouter';
import roleWaller, { Waller } from 'roles/waller';
import roleRemoteHarvester, { remoteHarvester } from 'roles/remoteRoles/remoteHarvester';
import roleRemoteBuilder, { remoteBuilder } from 'roles/remoteRoles/remoteBuilder';
import roleRemoteHauler, { remoteHauler } from 'roles/remoteRoles/remoteHauler';

function assignJobs(): void {
  Object.values(Game.creeps).forEach((creep) => {
    if (creep.memory.role === 'harvester') {
      roleHarvester.run(creep as Harvester);
    }
    if (creep.memory.role === 'upgrader') {
      roleUpgrader.run(creep as Upgrader);
    }
    if (creep.memory.role === 'builder') {
      if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length != 0) {
        roleBuilder.run(creep as Builder);
      } else {
        roleUpgrader.run(creep as Upgrader);
      }
    }
    if (creep.memory.role === 'repairer') {
      roleRepairer.run(creep as Repairer);
    }
    if (creep.memory.role === 'waller') {
      roleWaller.run(creep as Waller);
    }
    if (creep.memory.role === 'hauler') {
      roleHauler.run(creep as Hauler);
    }
    if (creep.memory.role === 'floater') {
      if (_.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester').length < 2) {
        roleHarvester.run(creep as Harvester);
      } else if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
        roleHauler.run(creep as Hauler);
      } else if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length != 0) {
        roleBuilder.run(creep as Builder);
      } else {
        roleUpgrader.run(creep as Upgrader);
      }
    }
    if (creep.memory.role === 'scouter') {
      roleScouter.run(creep as Scouter);
    }
    if (creep.memory.role === 'claimer') {
      roleClaimer.run(creep as Claimer);
    }
    if (creep.memory.role === 'remoteHarvester') {
      roleRemoteHarvester.run(creep as remoteHarvester);
    }
    if (creep.memory.role === 'remoteBuilder') {
      roleRemoteBuilder.run(creep as remoteBuilder);
    }

    if (creep.memory.role === 'remoteHauler') {
      roleRemoteHauler.run(creep as remoteHauler);
    }
  });
}

export { assignJobs };
