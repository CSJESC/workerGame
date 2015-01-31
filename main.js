(function () {
    "use strict"

    // from https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
    var nl2br = function (str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    };


    var status;
    var questions;

    var alreadyExausted = false;

    // get the data
    $.getJSON("data/gameData.json", function (data) {
        status = data.status;
        questions = data.questions;

        // add poisbility to link to winner
        questions.winner = {
            isWinner: true
        };

        // when dom is ready
        $(function () {
            // find the dom elements
            var $containerElem = $('.container'), $textElem = $('.text'), $a1Button = $('.a1-button'), $a2Button = $('.a2-button'), $a3Button = $('.a3-button'), $bothButtons = $a1Button.add($a2Button).add($a3Button)
            var imgBlock = $('.imgContainer img');
            var videoBlock = $('#videoBlock');
            var moneyImgElem = $('#moneyBlock img');
            var moneyElem = $('#money');
            var energyElem = $('#energyBlock img');

            var goToQuestion = function (question) {
                if (!question) {
                    // add code to handle game over
                    alert('game over');
                    return
                }
                if (question.isWinner) {
                    // add code to handle winner
                    alert('winner!');
                    return
                }

                // update view
                if(question.video){
                    imgBlock.css('display', 'none');
                    videoBlock.css('display', 'inline');
                    videoBlock.html(question.video);

                } else {
                    videoBlock.css('display', 'none');
                    videoBlock.html('');
                    imgBlock.css('display', 'inline');
                    imgBlock.attr('src', 'image/' + question.image);
                }
                $textElem.html(nl2br(question.text));
                // set button text if specified, if a2t use standard
                $a1Button.text(question.a1.text || '');
                $a2Button.text(question.a2.text || '');
                $a3Button.text(question.a3.text || '');

                // set actions for answers
                $bothButtons.unbind('click');
                $bothButtons.click(function (event) {
                    var answer;
                    if (event.target.dataset.answer == 'a1')
                        answer = question.a1;
                    else if (event.target.dataset.answer == 'a2')
                        answer = question.a2;
                    else
                        answer = question.a3;

                    status.money += Math.round(answer.money);
                    status.energy += answer.energy;


                    if (status.energy < 0) {
                        status.energy = 0;
                    }

                    applyEnergy(status.energy);
                    applyMoney(status.money);

                    if (!alreadyExausted && status.energy <= 0) {
                        alreadyExausted = true;
                        goToQuestion(questions['exhaustedquit'])
                    }
                    else {
                        goToQuestion(questions[answer.next])
                    }
                });
            };

            function applyEnergy(energy) {
                switch (energy) {
                    case 0:
                        imgBlock.attr('class', 'energylvl0');
                        energyElem.attr('src', 'image/energy/red.png');
                        break;
                    case 1:
                        imgBlock.attr('class', 'energylvl1');
                        energyElem.attr('src', 'image/energy/red.png');
                        break;
                    case 2:
                        imgBlock.attr('class', 'energylvl2');
                        energyElem.attr('src', 'image/energy/yellow.png');
                        break;
                    case 3:
                        imgBlock.attr('class', 'energylvl3');
                        energyElem.attr('src', 'image/energy/lightGreen.png');
                        break;
                    case 4:
                        imgBlock.attr('class', 'energylvl4');
                        energyElem.attr('src', 'image/energy/green.png');
                        break;
                    default:
                        alert('There is something wrong with the blur! REMOVE THIS BEFORE GOING LIVE! RAHHHHHHH!!!!!');
                        break;
                }
            }

            function applyMoney(money) {
                if (money < 0) {
                    moneyImgElem.attr('src','image/money/moneyDebt.png');
                } else if (money < 5) {
                    moneyImgElem.attr('src','image/money/money0.png');
                } else if (money < 100) {
                    moneyImgElem.attr('src','image/money/money1.png');
                } else if (money < 200) {
                    moneyImgElem.attr('src','image/money/money2.png');
                } else if (money < 300) {
                    moneyImgElem.attr('src','image/money/money3.png');
                } else if (money < 400) {
                    moneyImgElem.attr('src','image/money/money5.png');
                } else { // https://www.youtube.com/watch?v=sdl658l5TTQ
                    moneyImgElem.attr('src','image/money/money5.png');
                }
                moneyElem.html (money + ' USD / ' + (money * 6.25) + ' Yuan');
            }

            // setup initial view
            goToQuestion(questions['index'])
        })
    })
})();
