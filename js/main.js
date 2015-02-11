(function () {
    "use strict";

    // Source: https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
    var nl2br = function (str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    };

    $.getJSON("data/gameData.json", function (data) {
        //Defining a couple of variables we need
        var status = data.status; //Current player status
        var questions = data.questions; //Collection of all questions
        var exhausted = false; //Is reached when player energy is 0
        var workhard = false; //Player selected to "work hard"
        var grannydead = false; //Player let their grandmother die #Aufschrei
        var grannymoney = 0; //Counting how often the player has only sent a small amount of money to the grandma
        var leavingcounter = 0; //Counting how often the player decided to leave early
        var wage = true; //Wage block initiator
        var readAttendanceAwardDesc = false; //Has the player received the
        var currentQuestion; //Keeps the current question object
        var justWorkingCounter = 0; //Counting the amount of times the player has decided to leaver earlier.
        var clickableAnswerFound;

        // find the dom elements
        var $containerElem = $('.container'), $textElem = $('.text'), $a1Button = $('.a1-button'), $a2Button = $('.a2-button'), $a3Button = $('.a3-button'), $buttonCollection = $a1Button.add($a2Button).add($a3Button);
        var imgBlock = $('.imgContainer img');
        var videoBlock = $('#videoBlock');
        var moneyImgElem = $('#moneyBlock img');
        var moneyElem = $('#money');
        var energyElem = $('#energyBlock img');

        $(function () {
            var goToQuestion = function (question) {
                currentQuestion = question;
                // Updating image / video on top of the page
                applyView();

                // Updating button texts
                applyButtons();

                //Resetting the event handler for the buttons
                resetButtonEventHandler();

                //Apply updated energy and money
                applyEnergy(status.energy);
                applyMoney(status.money);
            };

            function applyEnergy(energy) {
                imgBlock.attr('class', 'energylvl' + energy);
                energyElem.attr('src', 'image/energy/e0' + energy + '.png');
            }

            function applyMoney(money) {
                if (money < 0) { //Obsolete case
                    moneyImgElem.attr('src', 'image/money/moneyDebt.png');
                } else if (money < 10) {
                    moneyImgElem.attr('src', 'image/money/money0.png');
                } else if (money < 100) {
                    moneyImgElem.attr('src', 'image/money/money1.png');
                } else if (money < 500) {
                    moneyImgElem.attr('src', 'image/money/money2.png');
                } else if (money < 1000) {
                    moneyImgElem.attr('src', 'image/money/money3.png');
                } else if (money < 1500) {
                    moneyImgElem.attr('src', 'image/money/money4.png');
                } else { // https://www.youtube.com/watch?v=sdl658l5TTQ
                    moneyImgElem.attr('src', 'image/money/money5.png');
                }
                $('#money').html(money + ' &#65509; / ' + (money / 6.25) + ' $');
            }

            function applyView() {
                //Checking if the current view contains a video
                if (currentQuestion.video) {
                    //Hidding image block and showing video block
                    imgBlock.css('display', 'none');
                    videoBlock.css('display', 'inline');

                    videoBlock.html(currentQuestion.video);
                } else {
                    //Current view has an image, hiding video block
                    videoBlock.css('display', 'none');
                    videoBlock.html('');
                    imgBlock.css('display', 'inline');

                    if (currentQuestion === questions["workcircle"] && workhard == true) { //Did the player choose to "work hard"? We'll show a different image in that case
                        imgBlock.attr('src', 'image/work2.png');
                    } else if ((currentQuestion === questions["minus"] || currentQuestion === questions["minusbusy"] || currentQuestion === questions["minuscircle"] || currentQuestion === questions["minuscircle2"]) && readAttendanceAwardDesc == false) {
                        //Showing an explanation of the attendance award
                        currentQuestion.text = questions["minusdesc"].text;
                        imgBlock.attr('src', 'image/minus.png');
                        readAttendanceAwardDesc = true;
                    } else if (currentQuestion === questions["workcircle2"] && workhard == true) {
                        //Different image for the second "work hard" work circle
                        imgBlock.attr('src', 'image/work3.png');
                    } else {
                        //Default case, just show the image that is used in the JSON file
                        imgBlock.attr('src', 'image/' + currentQuestion.image);
                    }
                }
            }

            function applyButtons() {
                //Looping through all answers
                clickableAnswerFound = false;
                $.each([currentQuestion.a1, currentQuestion.a2, currentQuestion.a3], function(answerNumber, answer) {
                    var extraText = "";
                    var currentButton = $('.a'+(answerNumber+1)+'-button');
                    if (answer.text) { //Skip answer if text is empty
                        if (answer.money == 'Random') { //Checking if answer requires a random monetary value
                            answer.money = Math.round((Math.random() * (answer.random_max - answer.random_min) + answer.random_min));
                            currentQuestion.text = currentQuestion.text.replace('%s', answer.money);
                        }
                        //Checking if player has enough money to use this answer
                        if (answer.money < 0 && ((status.money + answer.money) < 0)) {
                            extraText = '<span class="losing-money">' + answer.money + ' &#65509;</span>';
                            currentButton.addClass('disabledButton');
                        } else {
                            extraText = '';
                            clickableAnswerFound = true;
                            currentButton.removeClass('disabledButton');
                        }
                        //Assigning HTML to button
                        currentButton.html('&bull; ' + answer.text + extraText);
                    } else {
                        currentButton.html('');
                    }
                });
                //Updating question text
                $textElem.html(nl2br(currentQuestion.text));
            }

            function resetButtonEventHandler() {
                $buttonCollection.unbind('click');
                $buttonCollection.click(function (event) {
                    //Answer button click event
                    if (isButtonDisabled($(this))) {
                        return false;
                    }
                    var answer = getCurrentAnswer($(this).data().answer); //Checking which button was clicked
                    handleSpecialEvents(answer); //Handling some events that affect some global status variable
                    handleNextQuestionCall(answer); //Deciding what to do next
                });
            }

            function isButtonDisabled(button) {
                return button.hasClass('disabledButton');
            }

            function getCurrentAnswer(answerElem){
                switch(answerElem) {
                    case 'a1':
                        return currentQuestion.a1;
                        break;
                    case 'a2':
                        return currentQuestion.a2;
                        break;
                    case 'a3':
                        return currentQuestion.a3;
                        break;
                    default:
                        return null;
                        break;
                }
            }

            function handleSpecialEvents(answer) {
                //Handling various special answers / conditions in the game
                if (currentQuestion === questions["decisionwork"] && answer == currentQuestion.a1) {
                    workhard = true;
                } else if (currentQuestion === questions["grannydead"]) {
                    grannydead = true;
                } else if (currentQuestion === questions["fillenergy"] || currentQuestion === questions["fillenergy2"]) {
                    leavingcounter++;
                } else if (currentQuestion === questions["granny"] && grannydead == false && answer == currentQuestion.a2) {
                    grannymoney += 1;
                    wage = false;
                } else if (currentQuestion === questions["granny"] && (answer == currentQuestion.a1 || answer == currentQuestion.a3)) {
                    wage = false;
                } else if ((currentQuestion === questions["workcircle"] || currentQuestion === questions["workcircle2"]) && answer == currentQuestion.a1 && workhard == true) {
                    answer.energy = answer.energy * 2;
                } else if (currentQuestion == questions["wagecircle"] && workhard == true) {
                    answer.money += 300;
                } else if (currentQuestion == questions["workcircle"]) {
                    justWorkingCounter++;
                }

                //Updating the money and energy accordingly
                status.money += Math.round(answer.money);
                status.energy += answer.energy;

                //Failsafe boundaries for energy
                if (status.energy < 0) {
                    status.energy = 0;
                } else if (status.energy > 10) {
                    status.energy = 10;
                }
            }

            function handleNextQuestionCall(answer){
                if (!exhausted && status.energy <= 0) {
                    exhausted = true;
                    goToQuestion(questions['exhaustedquit']);
                } else if (justWorkingCounter == 6) {
                    goToQuestion(questions['leavingend']);
                } else if (grannydead == false && grannymoney >= 3) {
                    goToQuestion(questions['grannydead']);
                } else if ((currentQuestion === questions["exhaustedcircle2"] || currentQuestion === questions["minuscircle2"] || currentQuestion === questions["fillenergy2"]) && !wage) {
                    wage = true;
                    goToQuestion(questions['wagecircle']);
                } else if (leavingcounter >= 3) {
                    goToQuestion(questions['firedfill']);
                } else if (currentQuestion === questions["minuscircle2"] && grannydead == true && wage == true) {
                    wage = false;
                    goToQuestion(questions['helpparents']);
                } else if (currentQuestion === questions["exhaustedcircle2"] && grannydead == true && wage == true) {
                    wage = false;
                    goToQuestion(questions['helpparents']);
                } else if (currentQuestion === questions["fillenergy2"] && grannydead == true && wage == true) {
                    wage = false;
                    goToQuestion(questions['helpparents']);
                } else {
                    goToQuestion(questions[answer.next]);
                }
                if (!clickableAnswerFound) {
                    setTimeout(function(){triggerLinkAnimation();}, 2500);
                }
            }

            function triggerLinkAnimation() {
                moneyImgElem.animate({opacity: 0}, 1000, function() {
                    $('#energyBlock').animate({top: 200}, 1000, function() {
                        $('#linkBlock').animate({right: 30}, 1000, function() {
                        });
                    });
                });
            }

            // setup initial view
            goToQuestion(questions['index']);
        });
    })
})();