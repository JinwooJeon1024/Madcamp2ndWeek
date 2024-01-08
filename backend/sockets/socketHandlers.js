module.exports = function (io) {
    const rooms = {};
    io.on('connection', (socket) => {
        console.log('User connected' + socket.id);

        socket.on('joinRoom', (data) => {  // 방 정보는 객체로 받음
            const room = data.room;
            if(rooms[room] >= 4){
                console.log('Full Room');
            }
            else{
                const room = data.room;
                socket.join(room);
                if(rooms[room]) {
                rooms[room]++;
                } else {
                rooms[room] = 1;
                }
                console.log(`User ${socket.id} joined room ${room}. Total users: ${rooms[room]}`);
            }
        });
        socket.on('leaveRoom', (room) => {
            // 해당 방에서 참가자 제거
            socket.leave(room);

            // 방 정보 업데이트
            if (rooms[room]) {
                rooms[room]--;
                if (rooms[room] === 0) {
                    delete rooms[room]; // 방의 참가자가 없을 경우 방 삭제
                }
            }

            console.log(`User ${socket.id} left room ${room}. Remaining users: ${rooms[room] || 0}`);
            });
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                // 추가적인 방 참가자 관리 로직이 필요할 수 있음
            });
        })
};
