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

    var workhard = false;

    var grannydead = false;

    var grannymoney = 0;

    var leavingcounter = 0;

    var wage = true;

    var minusDesc = false;

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
                    if (question === questions["workcircle"] && workhard == true){
                        imgBlock.attr('src', 'image/work2.png');
                    }
                    else if ((question === questions["minus"] || question === questions["minusbusy"] || question === questions["minuscircle"] || question === questions["minuscircle2"]) && minusDesc == false) {
                        question.text = questions["minusdesc"].text;
                        imgBlock.attr('src', 'image/minus.png');  
                        minusDesc = true;
                    }
                    else if (question === questions["workcircle2"] && workhard == true) {
                        imgBlock.attr('src', 'image/work3.png');
                    }
                    else {
                        imgBlock.attr('src', 'image/' + question.image);
                    }
                }

                var extraText = "";
                // set button text if specified, if a2t use standard
                if(question.a1.text) {
                    if (question.a1.money == 'Random') {
                        question.a1.money = Math.round((Math.random() * (question.a1.random_max - question.a1.random_min) + question.a1.random_min));
                        question.text = question.text.replace('%s', ((Math.abs(Math.round(question.a1.money * 6.25)))));
                    }
                    if (question.a1.money < 0 && ((status.money + question.a1.money) < 0)) {
                        extraText = '<span class="losing-money">' + Math.round((question.a1.money * 6.25)) + ' &#65509;</span>';
                        $a1Button.addClass('disabledButton');
                    } else {
                        extraText = '';
                        $a1Button.removeClass('disabledButton');
                    }
                    $a1Button.html('&bull; ' + question.a1.text + extraText);
                } else {
                    $a1Button.html('');
                }
                if(question.a2.text){
                    if (question.a2.money < 0 && ((status.money + question.a2.money) < 0)) {
                        extraText = '<span class="losing-money">' + Math.round((question.a2.money * 6.25)) + ' &#65509;</span>';
                        $a2Button.addClass('disabledButton');
                    } else {
                        extraText = '';
                        $a2Button.removeClass('disabledButton');
                    }
                    $a2Button.html('&bull; ' + question.a2.text + extraText);
                } else {
                    $a2Button.html('');
                }
                if(question.a3.text){
                    if (question.a3.money < 0 && ((status.money + question.a3.money) < 0)) {
                        extraText = '<span class="losing-money">' + Math.round((question.a3.money * 6.25)) + ' &#65509;</span>';
                        $a3Button.addClass('disabledButton');
                    } else {
                        extraText = '';
                        $a3Button.removeClass('disabledButton');
                    }
                    $a3Button.html('&bull; ' + question.a3.text + extraText);
                } else {
                    $a3Button.text('');
                }
                $textElem.html(nl2br(question.text));
                // set actions for answers
                $bothButtons.unbind('click');
                $bothButtons.click(function (event) {
                    if ($(this).hasClass('disabledButton')) {
                        return false;
                    }
                    var answer;
                    if (event.target.dataset.answer == 'a1')
                        answer = question.a1;
                    else if (event.target.dataset.answer == 'a2')
                        answer = question.a2;
                    else
                        answer = question.a3;

                    if (question === questions["decisionwork"] && answer == question.a1) {
                        workhard = true;
                    }
                    else if (question === questions["grannydead"]) {
                       grannydead = true;
                    }
                    else if (question === questions["fillenergy"] || question === questions["fillenergy2"] ) {
                        leavingcounter++;
                    }
                    else if (question === questions["granny"] && grannydead == false && answer == question.a2) {
                        grannymoney += 1;
                        wage = false;
                    }
                    else if (question === questions["granny"] && (answer == question.a1 || answer == question.a3)) {
                        wage = false;
                    }
                    else if ((question === questions["workcircle"] || question === questions["workcircle2"]) && answer == question.a1 && workhard == true) {
                        answer.energy = answer.energy * 2;
                    }



                    status.money += Math.round(answer.money);
                    status.energy += answer.energy;

                    if (status.energy < 0) {
                        status.energy = 0;
                    } else if (status.energy > 10) {
                        status.energy = 10;
                    }

                    applyEnergy(status.energy);
                    applyMoney(status.money);

                    if (!alreadyExausted && status.energy <= 0) {
                        alreadyExausted = true;
                        goToQuestion(questions['exhaustedquit']);
                    }
                    else if (grannydead == false && grannymoney >= 3) {
                        goToQuestion(questions['grannydead']);
                    }
                    else if ((question === questions["exhaustedcircle2"] || question === questions["minuscircle2"] || question === questions["fillenergy2"]) && !wage){
                        wage = true;
                       goToQuestion(questions['wagecircle']);
                    }
                    else if (leavingcounter >= 3) {
                        goToQuestion(questions['firedfill']);
                    }
                    else if (question === questions["minuscircle2"] && grannydead == true && wage == true) {
                        wage = false;
                        goToQuestion(questions['helpparents']);
                    }
                    else if(question === questions["exhaustedcircle2"] && grannydead == true && wage == true) {
                        wage = false;
                        goToQuestion(questions['helpparents']);
                    }
                    else if (question === questions["fillenergy2"] && grannydead == true && wage == true) {
                        wage = false;
                        goToQuestion(questions['helpparents']);
                    }
                    else {
                        goToQuestion(questions[answer.next]);

                    }
                });
            };

            function applyEnergy(energy) {
                switch (energy) {
                    case 0:
                        imgBlock.attr('class', 'energylvl0');
                        energyElem.attr('src', 'image/energy/e00.png');
                        break;
                    case 1:
                        imgBlock.attr('class', 'energylvl1');
                        energyElem.attr('src', 'image/energy/e01.png');
                        break;
                    case 2:
                        imgBlock.attr('class', 'energylvl2');
                        energyElem.attr('src', 'image/energy/e02.png');
                        break;
                    case 3:
                        imgBlock.attr('class', 'energylvl3');
                        energyElem.attr('src', 'image/energy/e03.png');
                        break;
                    case 4:
                        imgBlock.attr('class', 'energylvl4');
                        energyElem.attr('src', 'image/energy/e04.png');
                        break;
                    case 5:
                        imgBlock.attr('class', 'energylvl5');
                        energyElem.attr('src', 'image/energy/e05.png');
                        break;
                    case 6:
                        imgBlock.attr('class', 'energylvl6');
                        energyElem.attr('src', 'image/energy/e06.png');
                        break;
                    case 7:
                        imgBlock.attr('class', 'energylvl7');
                        energyElem.attr('src', 'image/energy/e07.png');
                        break;
                    case 8:
                        imgBlock.attr('class', 'energylvl8');
                        energyElem.attr('src', 'image/energy/e08.png');
                        break;
                    case 9:
                        imgBlock.attr('class', 'energylvl9');
                        energyElem.attr('src', 'image/energy/e09.png');
                        break;
                    case 10:
                        imgBlock.attr('class', 'energylvl10');
                        energyElem.attr('src', 'image/energy/e10.png');
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
                moneyElem.html ((money * 6.25) + ' &#65509; / ' + money + ' $');
            }

            // setup initial view
            goToQuestion(questions['index'])
        })
    })
})();
