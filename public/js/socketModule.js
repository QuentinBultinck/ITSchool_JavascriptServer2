"use strict";

const socketModule = (function () {
    const socket = io('http://questions.dev:3000/questions-live');

    //TODO remove socket.on('connection_confirmation')
    socket
        .on('connection_confirmation', function (msg) {
            console.log(msg);
        })
        .on("error_occurred", function (error) {
            console.log(error);
            gInterface.showError(error);
        })
        .on("new_thread_available", function (threadHTML) {
            gInterface.addThread(threadHTML);
        })
        .on("threads", function (threadsHTML) {
            threadsHTML.forEach(threadHTML => {
                gInterface.addThread(threadHTML);
            })
        });

    return {
        sendQuestion: function (question) {
            socket.emit("new_question", question);
        },
        sendAnswer: function (threadId, answer) {
            socket.emit("new_answer", {threadId, answer});
        },
        findThreadsWithTag: function(tag){
            socket.emit("find_threads",tag);
        },
        isConnected: function () {
            return socket.connected;
        }
    }
})();