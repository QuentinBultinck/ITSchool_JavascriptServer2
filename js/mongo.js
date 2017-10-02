"use strict";

// SETTING UP MONGO
// ----------------
// 1. run mongo.exe
// 2. run some commands to create the DB:
// - use questionsDB
// - db.thread
// 3. you're good to go

// HANDY COMMANDS
// --------------
// db.thread.find()
// db.thread.remove()


let mongoDBModule = (function () {
    const mongo = require('mongodb');
    const MongoClient = mongo.MongoClient;

    const Thread = require("./thread.js").Thread;
    const Answer = require("./answer.js").Answer;
    const VoteAble = require("./voteAble.js").VoteAble;

    // TODO security?
    const dbConf = {
        // DB is written away in /data/db
        // questionsDB = database name;
        url: "mongodb://localhost:27017/questionsDB",

        // collections = tables
        collections: {
            thread: "thread"
        }
    };

    let openConnection = function () {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(dbConf.url)
                .catch(err => {
                    console.log("Failed to connect to " + dbConf.url);
                    reject(err);
                })
                .then(db => resolve(db));
        });
    };

    // TODO create db's?
    // create DB + collections(tables)
    let createDB = function () {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    console.log("Database created!");
                    db.createCollection(dbConf.collections.thread)
                        .catch(err => {
                            console.log("Failed to create collection (" + dbConf.collections.thread + ")");
                            reject(err);
                        })
                        .then(res => {
                            console.log("Collection created");
                            db.close();
                            resolve(res);
                        });
                });
        });
    };

    // TODO drop db's?
    let dropDB = function () {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    db.drop();
                    db.close();
                    resolve();
                });
        });
    };

    let addThread = function (thread) {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    db.collection(dbConf.collections.thread).insertOne(thread)
                        .catch(err => {
                            console.log("Failed to add thread (" + thread.question + ") to collection + ("
                                + dbConf.collections.thread + ")");
                            reject(err);
                        })
                        .then(res => {
                            console.log("Added thread (" + thread.question + ")");
                            db.close();
                            resolve(res);
                        });
                });
        });
    };

    let getAllThreads = function () {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    db.collection(dbConf.collections.thread).find({}).toArray()
                        .catch(err => {
                            console.log("Failed to query all threads from (" + dbConf.collections.thread + ")");
                            reject(err);
                        })
                        .then(res => {
                            db.close();
                            let threads = [];
                            res.forEach(item => {
                                threads.push(new Thread(item.question, item.answers, item.upVotes, item.downVotes));
                            });
                            resolve(threads)
                        });
                });
        });
    };

    // TODO refactor
    let addAnswerToThread = function (threadQuestion, answer) {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    getThreadByQuestion(threadQuestion)
                        .catch(err => reject(err))
                        .then(thread => {
                            if (thread.isAnswerUnique(answer)) {
                                thread.addNewAnswer(answer);
                                let query = {question: thread.question};
                                db.collection(dbConf.collections.thread).updateOne(query, thread)
                                    .catch(err => reject(err))
                                    .then((res) => {
                                        db.close();
                                        resolve(res);
                                    });
                            } else {
                                reject("Answer is not unique");
                            }
                        });
                });
        });
    };

    let getThreadByQuestion = function (question) {
        return new Promise(function (resolve, reject) {
            openConnection()
                .catch(err => reject(err))
                .then(db => {
                    let query = {question: question};
                    db.collection(dbConf.collections.thread).find(query).toArray()
                        .catch(err => reject(err))
                        .then(res => {
                            db.close();
                            resolve(new Thread(res[0].question, res[0].answers, res[0].upVotes, res[0].downVotes));
                        });
                });
        });
    };

    // TODO look what stuff needs to be public
    let publicStuff = {
        createDB,
        dropDB,
        addThread,
        getAllThreads,
        getThreadByQuestion,
        addAnswerToThread
    };

    return publicStuff;
})();

module.exports = {
    mongoDBModule
};