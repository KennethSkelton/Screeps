declare global {
  interface RoomMemory {
    sources: { [id: Id<Source>]: SourceInfo };
  }
}
declare global {
  interface SourceInfo {
    workerSpots: number;
  }
}

function storeSourcesInMemory(room: Room): void {
  if (!Memory.rooms[room.name]) {
    const roomSources = room.find(FIND_SOURCES);
    roomSources.forEach((source) => {
      const info: SourceInfo = { workerSpots: 1 };
      Memory.rooms[room.name] = { sources: { [source.id]: info } };
    });
  }
}

/*
function oneOrTwoOrThree(schemaLevel: number) {
  if (schemaLevel < 1) {
    return 3;
  } else if (schemaLevel < 2) {
    return 2;
  } else {
    return 1;
  }
}*/

/*
function numberOfClearAjacentSquares(object: RoomObject): number{
    const position = object.pos
    /*
    console.log(position)
    console.log(position.y)
    console.log(position.x)


    const top = position.y - 1
    const bottom = position.y + 1
    const left = position.x - 1
    const right = position.x + 1

    /*
    console.log("top: ", top)
    console.log("bottom: ", bottom)
    console.log("left: ", left)
    console.log("right: ", right)


    const area = Game.rooms[object.pos.roomName].lookAtArea(top, left, bottom, right)
    let clearSqaures = 0

    //console.log("area: ",area)

    for(const vertical in area){
        //console.log("vertical: ", vertical)
        //console.log("keys of vertical: ", Object.keys(area[vertical]))
        for(const horizontal in area[vertical]){
            //console.log("horizonal: ", horizontal)
            for(const location of area[vertical][horizontal]){
                /*
                console.log("location: ", horizontal, vertical)
                console.log("type: ", location.type)
                console.log(OBSTACLE_OBJECT_TYPES)
                console.log("is it included: ", OBSTACLE_OBJECT_TYPES.includes(location.type))
                console.log("keys of location: ", Object.keys(location))
                console.log("is the square occupied: ", OBSTACLE_OBJECT_TYPES.includes(location.type))
                console.log("is the terrain a wall: ", (location.type == "terrain" && location.terrain == "wall"))


                // eslint-disable-next-line max-len
                if((location.type === "terrain" && (location.terrain != "wall"))){
                    clearSqaures+=1
                }
            }

            //console.log("The location is clear: ", isLocationClear)
        }
    }

    return clearSqaures
}
*/

export { storeSourcesInMemory };
