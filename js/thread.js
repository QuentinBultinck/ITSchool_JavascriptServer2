"use strict";

const VoteAble = require("./voteAble.js").VoteAble;
const Answer = require("./answer.js").Answer;

let Thread = function(question, answers, upVotes, downVotes){
    VoteAble.call(this, upVotes, downVotes);
    this.question = question;
    this.answers = (answers === undefined) ? [] : answers;
    this.isAnswerUnique = function(answerToCheck){
        let filteredAnswers = this.answers.filter(answer => answer.answer === answerToCheck);
        return filteredAnswers.length === 0;
    };
    this.addNewAnswer = function(answer){
        this.answers.push(new Answer(answer));
    };
};

Thread.prototype = Object.create(VoteAble.prototype);
Thread.prototype.constructor = Thread;

module.exports = {
    Thread
};