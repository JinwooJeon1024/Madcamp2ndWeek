module.exports = function (io) {
    let rooms = {};
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('createRoom', (data) => {
            const hostName = data.hostName;
            const hostID = data.hostID
            const roomName = data.roomName;
            const numOfPlayer = data.numOfPlayer
            let roomCode = generateRoomCode(); // 6자리 방 코드 생성 함수

            rooms[roomCode] = { playerIDs: [hostID], 
                                playerNames: [hostName], 
                                numOfPlayer: numOfPlayer,
                                roomName: roomName,
                                roomCode: roomCode
                            };
            socket.join(roomCode);
            console.log('room Created!:', roomCode);
            console.log('All existing room codes:', Object.keys(rooms).join(', '));
        });

        socket.on('joinRoom', (data) => {
            const roomCode = data.roomCode;
            const userName = data.userName;
            const userID = data.userID;
            console.log(rooms[roomCode].numOfPlayer);
            console.log(rooms[roomCode].playerIDs.length);
            if (rooms[roomCode]) {
                if(rooms[roomCode].playerIDs.length >= rooms[roomCode].numOfPlayer){
                    console.log("Full room");
                }
                else{
                    rooms[roomCode].playerIDs.push(userID);
                    rooms[roomCode].playerNames.push(userName);
                    let playerId = rooms[roomCode].playerIDs.length - 1;
                    socket.join(roomCode);
                    console.log('room Joined!:', roomCode, 'playerID:',playerId);
                } 
            }
            else{
                socket.emit('error', { message: 'Room not found!' });
            }
        });

        socket.on('fetchRooms', () => {
        // rooms 객체를 배열로 변환
            const roomsArray = Object.keys(rooms).map(key => {
                return {
                    roomCode: key,
                    ...rooms[key]  // Spread 연산자를 사용하여 각 방의 상세 정보 포함
                };
            });
            socket.emit('updateRooms', roomsArray); // 모든 클라이언트에게 방 목록 배열을 전송
        });

        socket.on('gameStart', (data) => {
            const roomCode = data.roomCode;
            if (rooms[roomCode]) {
                const playersInRoom = rooms[roomCode].players;
                const numOfPlayer = rooms[roomCode].numOfPlayer;
                const playerNames = rooms[roomCode].playerName;

                const payload = {
                    roomCode: roomCode,
                    players: playersInRoom,
                    playerNames: playerNames,
                    numOfPlayer: numOfPlayer
                };

                console.log('game Started!:', roomCode);
                io.to(roomCode).emit('gameStarted', payload);
            } else {
                console.log('Room not found:', roomCode);
            }
        });

    socket.on("roomQuit", (data) => {
    const { roomCode, userId } = data;
    const room = rooms[roomCode];

    if (room) {
    // 사용자를 방의 플레이어 목록에서 제거
    const playerIndex = room.playerIDs.indexOf(userId);
    if (playerIndex > -1) {
        room.playerIDs.splice(playerIndex, 1);
        room.playerNames.splice(playerIndex, 1);
    }

    // 변경된 방 정보를 모든 참가자에게 전송
    io.to(roomCode).emit('roomUpdated', {
        roomCode: roomCode,
        playerIDs: room.playerIDs,
        playerNames: room.playerNames,
        numOfPlayer: room.numOfPlayer
    });

    // 소켓이 해당 방을 나가게 함
    socket.leave(roomCode);
    }
    });


        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        
    });

    function generateRoomCode() {
    let roomCode;
    do {
        roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    } while (rooms[roomCode]); // 방코드가 이미 존재하면 다시 생성
    return roomCode;
    }
};
