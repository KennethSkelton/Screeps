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
  if (!Memory.remoteOperations) {
    Memory.remoteOperations = {};
  }

  for (const operation of operationList) {
    if (!Memory.remoteOperations[operation.roomName]) {
      Memory.remoteOperations[operation.roomName] = { stage: 0, type: operation.type };
    } else {
      const operationInfo = Memory.remoteOperations[operation.roomName];
      if (operationInfo.type === 'remoteMine') {
        remoteMine(spawnName, operation.roomName, operationInfo.stage);
      } else if (operationInfo.type === 'remoteRaid') {
        remoteRaid(spawnName, operation.roomName, operationInfo.stage);
      }
    }
  }
}

function remoteRaid(spawnName: string, roomName: string, stage: number) {
  if (Game.rooms[roomName]) {
    if (!Game.flags[`${roomName}_Staging_Area`]) {
      Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
    }
  }
  if (stage > 0) {
    const quota: { role: string; amount: number }[] = [
      { role: 'scouter', amount: 1 },
      { role: 'fighter', amount: 3 },
      { role: 'shooter', amount: 3 }
    ];
    spawnFromQuota(spawnName, quota, true, roomName);
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

  if (Game.rooms)
    if (stage > 1) {
      const amount = Game.rooms[roomName].find(FIND_SOURCES).length;
      const quota: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'claimer', amount: 1 },
        { role: 'remoteHarvester', amount: amount },
        { role: 'remoteHauler', amount: amount },
        { role: 'remoteBuilder', amount: 2 }
      ];
      spawnFromQuota(spawnName, quota, true, roomName);
    } else if (stage > 0) {
      const amount = Game.rooms[roomName].find(FIND_SOURCES).length;
      const quota: { role: string; amount: number }[] = [
        { role: 'scouter', amount: 1 },
        { role: 'claimer', amount: 1 },
        { role: 'remoteHarvester', amount: amount },
        { role: 'remoteHauler', amount: amount }
      ];
      spawnFromQuota(spawnName, quota, true, roomName);
    } else {
      const quota: { role: string; amount: number }[] = [{ role: 'scouter', amount: 1 }];
      spawnFromQuota(spawnName, quota, true, roomName);
    }
}

export { remoteMine, remoteOperations };
