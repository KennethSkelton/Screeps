import profiler from 'screeps-profiler';
import roleBuilder, { Builder } from 'roles/builder';
import roleHarvester, { Harvester } from 'roles/harvester';
import roleUpgrader, { Upgrader } from 'roles/upgrader';
import roleRepairer, { Repairer } from 'roles/repairer';
import roleHauler, { Hauler } from 'roles/hauler';
import roleClaimer, { Claimer } from 'roles/remoteRoles/claimer';
import roleScouter, { Scouter } from 'roles/remoteRoles/scouter';
import roleWaller, { Waller } from 'roles/waller';
import roleRemoteHarvester, { RemoteHarvester } from 'roles/remoteRoles/remoteHarvester';
import roleRemoteBuilder, { RemoteBuilder } from 'roles/remoteRoles/remoteBuilder';
import roleRemoteHauler, { RemoteHauler } from 'roles/remoteRoles/remoteHauler';
import roleShooter, { Shooter } from 'roles/combatRoles/shooter';
import roleFighter, { Fighter } from 'roles/combatRoles/fighter';
import roleStunner, { Stunner } from 'roles/combatRoles/stunner';
import roleColonyBuilder, { ColonyBuilder } from 'roles/remoteRoles/colonyBuilder';
import roleRunner, { Runner } from 'roles/runner';
import roleRangedDefender, { RangedDefender } from 'roles/combatRoles/rangedDefender';

function assignJobs(): void {
  const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester').length;
  const haulers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester').length;

  Object.values(Game.creeps).forEach((creep) => {
    if (creep.memory.role === 'harvester') {
      roleHarvester.run(creep as Harvester);
    }
    if (creep.memory.role === 'upgrader') {
      if (haulers < 2) {
        roleHauler.run(creep as Hauler);
      } else {
        roleUpgrader.run(creep as Upgrader);
      }
    }
    if (creep.memory.role === 'builder') {
      if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length != 0) {
        roleBuilder.run(creep as Builder);
      } else {
        roleUpgrader.run(creep as Upgrader);
      }
    }
    if (creep.memory.role === 'repairer') {
      if (harvesters < 2) {
        roleHarvester.run(creep as Harvester);
      } else {
        roleRepairer.run(creep as Repairer);
      }
    }
    if (creep.memory.role === 'waller') {
      if (harvesters < 2) {
        roleHarvester.run(creep as Harvester);
      } else {
        roleWaller.run(creep as Waller);
      }
    }
    if (creep.memory.role === 'hauler') {
      roleHauler.run(creep as Hauler);
    }
    if (creep.memory.role === 'floater') {
      if (harvesters < 2) {
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
      roleRemoteHarvester.run(creep as RemoteHarvester);
    }
    if (creep.memory.role === 'remoteBuilder') {
      roleRemoteBuilder.run(creep as RemoteBuilder);
    }
    if (creep.memory.role === 'remoteHauler') {
      roleRemoteHauler.run(creep as RemoteHauler);
    }
    if (creep.memory.role === 'shooter') {
      roleShooter.run(creep as Shooter);
    }
    if (creep.memory.role === 'fighter') {
      roleFighter.run(creep as Fighter);
    }
    if (creep.memory.role === 'stunner') {
      roleStunner.run(creep as Stunner);
    }
    if (creep.memory.role === 'colonyBuilder') {
      roleColonyBuilder.run(creep as ColonyBuilder);
    }
    if (creep.memory.role === 'runner') {
      roleRunner.run(creep as Runner);
    }
    if (creep.memory.role === 'rangedDefender') {
      roleRangedDefender.run(creep as RangedDefender);
    }
  });
}
profiler.registerFN(assignJobs, 'JobAssignment');

export { assignJobs };
