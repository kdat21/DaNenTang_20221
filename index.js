require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { PORT } = require("./constants/constants");
const { MONGO_URI } = require("./constants/constants");
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
// const MessageModel = require("../models/Messages");

// connect to mongodb
mongoose.connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(res => {
        console.log("connected to mongodb");
    })
    .catch(err => {
        console.log(err);
    })
const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } })
// Socket.io chat realtime
io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`);

    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`user ${socket.id} join ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`user ${socket.id} leave ${conversationId}`);
    });

    socket.on("sendMessage", (data) => {
        console.log(
            `new message '${data.content}' at conversation ${data.chatId}`
        );
        socket
            .to(data.chatId)
            .emit("newMessageSent", data);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});// use middleware to parse body req to json
app.use(express.json());

// use middleware to enable cors
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// route middleware
app.use("/", mainRouter);

app.get('/settings', function (req, res) {
    res.send('Settings Page');
});


server.listen(PORT, () => {
    console.log("server start - " + PORT);
})


