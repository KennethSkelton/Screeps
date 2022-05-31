import { spawnFromQuota } from 'spawning';

declare global {
  interface Memory {
    remoteOperations: { [name: string]: operationInfo };
  }
}

declare global {
  interface operationInfo {
    stage: number;
    type: string;
  }
}

function remoteOperations(spawnName: string, operationList: { roomName: string; type: string }[]): void {
  if (
    Game.spawns[spawnName].room.find(FIND_MY_CREEPS, {
      filter: function (creep: Creep) {
        return creep.memory.role == 'harvester';
      }
    }).length < 2
  ) {
    console.log('Emergency roomOperation postponed');
  } else {
    if (!Memory.remoteOperations) {
      Memory.remoteOperations = {};
    }
    for (const operation of operationList) {
      if (!Memory.remoteOperations[operation.roomName + '_' + operation.type]) {
        Memory.remoteOperations[operation.roomName + operation.type] = { stage: 0, type: operation.type };
      } else {
        const operationInfo = Memory.remoteOperations[operation.roomName + '_' + operation.type];
        if (operationInfo.type === 'remoteMine') {
          remoteMine(spawnName, operation.roomName, operationInfo.stage);
        } else if (operationInfo.type === 'remoteRaid') {
          remoteRaid(spawnName, operation.roomName, operationInfo.stage);
        } else if (operationInfo.type === 'colonize') {
          colonize(spawnName, operation.roomName, operationInfo.stage);
        } else if (operationInfo.type === 'clearHostiles') {
          clearHostiles(spawnName, operation.roomName, operationInfo.stage);
        }
      }
    }
  }
}

function clearHostiles(spawnName: string, roomName: string, stage: number): void {
  if (Game.rooms[roomName]) {
    if (!Game.flags[`${roomName}_Staging_Area`]) {
      Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
    }
  }
  const quota: { role: string; amount: number }[] = [
    { role: 'fighter', amount: 3 },
    { role: 'shooter', amount: 2 }
  ];
  spawnFromQuota(spawnName, quota, true, roomName);
}

function remoteRaid(spawnName: string, roomName: string, stage: number): void {
  if (Game.rooms[roomName]) {
    if (!Game.flags[`${roomName}_Staging_Area`]) {
      Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
    }
  }
  if (stage > 0) {
    const quota: { role: string; amount: number }[] = [
      { role: 'scouter', amount: 1 },
      { role: 'fighter', amount: 3 },
      { role: 'shooter', amount: 2 },
      { role: 'stunner', amount: 1 }
    ];
    spawnFromQuota(spawnName, quota, true, roomName);
  } else {
    const quota: { role: string; amount: number }[] = [{ role: 'scouter', amount: 1 }];
    spawnFromQuota(spawnName, quota, true, roomName);
  }
}

function colonize(spawnName: string, roomName: string, stage: number): void {
  if (Game.rooms[roomName]) {
    if (!Game.flags[`${roomName}_Staging_Area`]) {
      Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
    }
  }

  if (stage > 1) {
    if (Game.rooms[roomName].controller?.my) {
      if (!Game.rooms[roomName].lookForAt(LOOK_CONSTRUCTION_SITES, 26, 16).length) {
        Game.rooms[roomName].createConstructionSite(26, 16, STRUCTURE_SPAWN, 'Spawn2');
      }
      const quota1: { role: string; amount: number }[] = [{ role: 'claimer', amount: 1 }];
      const quota2: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'colonyBuilder', amount: 2 }
      ];
      spawnFromQuota(spawnName, quota1, true, roomName, 2);
      spawnFromQuota(spawnName, quota2, true, roomName);
    } else {
      Memory.remoteOperations[roomName].stage -= 1;
    }
  } else if (stage > 0) {
    if (Game.rooms[roomName]) {
      const quota: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'claimer', amount: 1 }
      ];
      spawnFromQuota(spawnName, quota, true, roomName, 2);
    } else {
      Memory.remoteOperations[roomName].stage -= 1;
    }
  } else {
    const quota: { role: string; amount: number }[] = [{ role: 'scouter', amount: 1 }];
    spawnFromQuota(spawnName, quota, true, roomName);
  }
}

function remoteMine(spawnName: string, roomName: string, stage: number): void {
  if (Game.rooms[roomName]) {
    if (!Game.flags[`${roomName}_Staging_Area`]) {
      Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
    }
  }

  if (stage > 1) {
    if (Game.rooms[roomName]) {
      const amount = Game.rooms[roomName].find(FIND_SOURCES).length;
      const quota: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'claimer', amount: 1 },
        { role: 'remoteHarvester', amount: amount },
        { role: 'remoteHauler', amount: amount + 1 }
        //{ role: 'remoteBuilder', amount: 1 }
      ];
      spawnFromQuota(spawnName, quota, true, roomName);
    } else {
      Memory.remoteOperations[roomName].stage -= 1;
    }
  } else if (stage > 0) {
    if (Game.rooms[roomName]) {
      const amount = Game.rooms[roomName].find(FIND_SOURCES).length;
      const quota: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'claimer', amount: 1 },
        { role: 'remoteHarvester', amount: amount },
        { role: 'remoteHauler', amount: amount }
      ];
      spawnFromQuota(spawnName, quota, true, roomName);
    } else {
      Memory.remoteOperations[roomName].stage -= 1;
    }
  } else {
    const quota: { role: string; amount: number }[] = [{ role: 'scouter', amount: 1 }];
    spawnFromQuota(spawnName, quota, true, roomName);
  }
}

export { remoteMine, remoteOperations, colonize, clearHostiles };
