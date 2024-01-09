module.exports = function (io) {
    let rooms = {};
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('createRoom', (data) => {
            const hostName = data.hostName;
            const roomName = data.roomName;
            let roomCode = generateRoomCode(); // 6자리 방 코드 생성 함수
            rooms[roomCode] = { host: socket.id, 
                                players: [socket.id], 
                                playerName: [hostName], 
                                numOfPlayer: 1,
                                roomName: roomName
                            };
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode, 
                                        playerId: 0, 
                                        socketID: socket.id, 
                                        playerNames: rooms[roomCode].playerName });
            console.log('room Created!:', roomCode);
            console.log('All existing room codes:', Object.keys(rooms).join(', '));
        });

        socket.on('joinRoom', (data) => {
            const roomCode = data.roomCode;
            const userName = data.userName;
            console.log(rooms[roomCode].numOfPlayer);
            if (rooms[roomCode]) {
                if(rooms[roomCode].numOfPlayer >= 4){
                    console.log("Full room");
                }
                else{
                    rooms[roomCode].players.push(socket.id);
                    rooms[roomCode].playerName.push(userName);
                    rooms[roomCode].numOfPlayer++;
                    let playerId = rooms[roomCode].players.length - 1;
                    socket.join(roomCode);
                    io.to(data.roomCode)
                        .emit('roomJoined', { roomCode, 
                                            playerId, 
                                            socketID: socket.id, 
                                            playerNames: rooms[roomCode].playerName });
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
            const roomCode = data.roomCode;
            const socketID = data.socketID;

            // 플레이어를 방의 플레이어 목록에서 제거
            for(let i=0;i<rooms[roomCode].players.length;i++){
                console.log(rooms[roomCode].players[i]);
                if(rooms[roomCode].players[i] === socketID){
                    rooms[roomCode].players.splice(i, 1);
                }
            }

            //가장 마지막에 들어온 사람이 나갔다가 들어오는 것은 문제 X
            //하지만 이미 들어와있던 사람이 나갔다가 들어오면 playerID가 꼬임
            //playerID를 재조정하고 클라이언트에 업데이트 해주는 코드를 추가해줘야함
            
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
