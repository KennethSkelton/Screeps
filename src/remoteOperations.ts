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
  for (const operation of operationList) {
    if (!Memory.remoteOperations[operation.roomName]) {
      Memory.remoteOperations[operation.roomName] = { stage: 0, type: operation.type };
    } else {
      const operationInfo = Memory.remoteOperations[operation.roomName];
      if (operationInfo.type === 'remoteMine') {
        remoteMine(spawnName, operation.roomName, operationInfo.stage);
      }
    }
  }
}

function remoteMine(spawnName: string, roomName: string, stage: number): void {
  if (Game.flags[`${roomName}_Staging_Area`]) {
    Game.rooms[roomName].createFlag(25, 25, `${roomName}_Staging_Area`);
  }

  if (stage < 3) {
    const quota: Record<string, number>[] = [
      { scout: 1 },
      { claimer: 1 },
      { harvester: Game.rooms[roomName].find(FIND_SOURCES).length },
      { remoteBuilder: 2 }
    ];
    spawnFromQuota(spawnName, quota, true, roomName);
  } else if (stage < 2) {
    const quota: Record<string, number>[] = [
      { scout: 1 },
      { claimer: 1 },
      { remoteHarvester: Game.rooms[roomName].find(FIND_SOURCES).length }
    ];
    spawnFromQuota(spawnName, quota, true, roomName);
  } else if (stage < 1) {
    const quota: Record<string, number>[] = [{ scouter: 1 }];
    spawnFromQuota(spawnName, quota, true, roomName);
  }
}

export { remoteMine, remoteOperations };
