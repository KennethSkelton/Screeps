export interface Repairer extends Creep {
    memory: RepairerMemory;
  }

  interface RepairerMemory extends CreepMemory {
    role: 'repairer';
    repairing: boolean;
  }


const roleRepairer = {
    /** @param {Creep} creep **/
    run(creep: Repairer):void {
        //work
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('⚡ repairing');
        }

        if(creep.memory.repairing) {
            const targets = creep.room.find(FIND_STRUCTURES, { filter: isDamaged })


            targets.sort((a,b) => a.hits - b.hits);


            if(targets.length > 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        else {
            const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);
            if(droppedResources.length != 0){
                if (creep.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedResources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else{
                const sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            }
        }
    }
}

function isDamaged(structure: Structure): boolean {
    return structure.hits < structure.hitsMax;
  }


export default roleRepairer
