module.exports = function (io) {
    let rooms = {};
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('createRoom', (data) => {
            const roomName = data.roomName;
            const numOfPlayer = data.numOfPlayer
            let roomCode = generateRoomCode(); // 6자리 방 코드 생성 함수
            rooms[roomCode] = { playerIDs: [], 
                                playerNames: [], 
                                numOfPlayer: numOfPlayer,
                                roomName: roomName,
                                roomCode: roomCode
                            };
            socket.join(roomCode);
            const roomsArray = Object.keys(rooms).map(key => {
                return {
                    roomCode: key,
                    ...rooms[key]  // Spread 연산자를 사용하여 각 방의 상세 정보 포함
                };
            });
            socket.emit('updateRooms', roomsArray); // 모든 클라이언트에게 방 목록 배열을 전송
            socket.emit('roomCreated', roomCode);
            console.log('room Created!:', roomCode);
            console.log('All existing room codes:', Object.keys(rooms).join(', '));
        });

        socket.on('joinRoom', (data) => {
            const roomCode = data.roomCode;
            const userName = data.userName;
            const userID = data.userID;

            if (rooms[roomCode]) {
                if (rooms[roomCode].playerIDs.length < rooms[roomCode].numOfPlayer) {
                    rooms[roomCode].playerIDs.push(userID);
                    rooms[roomCode].playerNames.push(userName);
                    
                    socket.join(roomCode);
                    console.log('room Joined!:', roomCode, 'UserID:', userID);

                    io.to(roomCode).emit('updateRoom', rooms[roomCode]);
                } else {
                    console.log("Full room");
                    socket.emit('error', { message: 'Room is full!' });
                }
            } else {
                console.log('Room not found:', roomCode);
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
    io.to(roomCode).emit('updateRoom', rooms[roomCode]);

    // 소켓이 해당 방을 나가게 함
    if (room.playerIDs.length === 0) {
        delete rooms[roomCode];
    }
    socket.leave(roomCode);
    }
    });

 socket.on('endTurn', (data) => {
    const roomCode = findRoomByPlayerId(data.playerId);
    if (roomCode) {
      const room = rooms[roomCode];
      const currentPlayerIndex = room.playerIDs.indexOf(data.playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % room.playerIDs.length;
      const nextPlayerId = room.playerIDs[nextPlayerIndex];
      const pile = data.pile;

      // 다음 플레이어에게 턴을 넘깁니다.
      io.to(roomCode).emit('turnChanged', { currentPlayerId: nextPlayerId, pile: pile});
      console.log(nextPlayerId)
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

    function findRoomByPlayerId(playerId) {
    return Object.keys(rooms).find(roomCode => rooms[roomCode].playerIDs.includes(playerId));
    }
};