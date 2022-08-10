const http = require('http')
const { Server } = require("socket.io")

const server = http.createServer()
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: "http://localhost:9000"
    }
})

let playerStorage = {}

io.on('connection', (socket) => {
    console.log(socket.id + ' connected')
    socket.join('anteroom')
    socket.to('anteroom').emit('announcements', { message: socket.id  + ' has joined' })

    socket.on('joinGame', (data) => {
        socket.join(data.roomName)
        addNewPlayer(socket.id, data)
        let text = socket.id + ' has entered room: ' + data.roomName
        socket.to(data.roomName).emit('announcements', { message: text })
        socket.emit('gameplay', {data: Object.values(playerStorage)})
        socket.to(playerStorage[socket.id]['roomName']).emit('gameplay', {data: Object.values(playerStorage)})
        console.log(data)
        console.log(text)
    })

    socket.on('increaseValue', (data) => {
        if (playerStorage[socket.id] === undefined) {
            return
        }
        playerStorage[socket.id].value += data.by
        socket.emit('gameplay', {data: Object.values(playerStorage)})
        socket.to(playerStorage[socket.id]['roomName']).emit('gameplay', {data: Object.values(playerStorage)})
        console.log(playerStorage)
    })

    socket.on('decreaseValue', (data) => {
        playerStorage[socket.id].value -= data.by
        socket.emit('gameplay', {data: Object.values(playerStorage)})
        socket.to(playerStorage[socket.id]['roomName']).emit('gameplay', {data: Object.values(playerStorage)})
        console.log(playerStorage)
    })

    socket.on('syncTime', (data) => {
        playerStorage[socket.id].timestamp = data.timestamp
        socket.emit('gameplay', {data: Object.values(playerStorage)})
        socket.to(playerStorage[socket.id]['roomName']).emit('gameplay', {data: Object.values(playerStorage)})
        console.log(playerStorage)
    })

    socket.on('disconnect', () => {
        if (playerStorage[socket.id] !== undefined) {
            let roomName = playerStorage[socket.id]['roomName']
            delete playerStorage[socket.id]
            socket.to(roomName).emit('gameplay', {data: Object.values(playerStorage)})
        }
        console.log(socket.id + ' disconnected')
    })
})

function addNewPlayer(playerId, playerData) {
    if (playerStorage[playerId] === undefined) playerStorage[playerId] = {
        playerId: playerId,
        value: 0,
        timestamp: 0,
        playerName: playerData.playerName,
        roomName: playerData.roomName,
    }
}

function emitStorage(socket) {
    socket.emit('gameplay', {data: Object.values(playerStorage)})
    socket.to(playerStorage[socket.id]['roomName']).emit('gameplay', {data: Object.values(playerStorage)})
}

io.engine.on("connection_error", (err) => {
    console.log(err.req)
    console.log(err.code)
    console.log(err.message)
    console.log(err.context)
})

server.listen(50201, () => {
    console.log('listening on *:50201')
})