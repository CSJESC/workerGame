(function () {
    "use strict"

    // from https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
    var nl2br = function (str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    };


    var status;
    var questions;

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
            var $containerElem = $('.container'), $moneyElem = $('.status-bar .money'), $energyElem = $('.status-bar .energy'), $textElem = $('.text'), $a1Button = $('.a1-button'), $a2Button = $('.a2-button'), $a3Button = $('.a3-button'), $bothButtons = $a1Button.add($a2Button).add($a3Button)

            var goToQuestion = function (question) {
                if (!question) {
                    // add code to handle game over
                    alert('game over')
                    return
                }
                if (question.isWinner) {
                    // add code to handle winner
                    alert('winner!')
                    return
                }

                // update view
                $('#pixelArt').attr('src', 'image/' + question.image);
                $textElem.html(nl2br(question.text));
                $moneyElem.text(status.money);
                $energyElem.text(status.energy);
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

                    status.money += answer.money;
                    status.energy += answer.energy;

                    applyImageFilters(status.energy);

                    if (status.energy <= 0) {
                        status.energy = 1; //should actually be 0 I guess, but is difficult with the if statement before
                        goToQuestion(questions['exhaustedquit'])
                    }
                    else {
                        goToQuestion(questions[answer.next])
                    }
                });
            };

            function applyImageFilters(energy) {
                var pixelArtElem = $('#pixelArt');
                switch (energy) {
                    case 1:
                        pixelArtElem.css("filter", "blur(2px) grayscale(0.6) hue-rotate(10deg)");
                        pixelArtElem.css("-webkit-filter", "blur(2px) grayscale(0.6) hue-rotate(10deg)");
                        break;
                    case 2:
                        pixelArtElem.css("filter", "blur(1px) grayscale(0.3) hue-rotate(5deg)");
                        pixelArtElem.css("-webkit-filter", "blur(1px) grayscale(0.3) hue-rotate(5deg)");
                        break;
                    case 3:
                        pixelArtElem.css("filter", "none");
                        pixelArtElem.css("-webkit-filter", "none");
                        break;
                    default:
                        alert('Halp everything is broken I am not good with computas.');
                        break;
                }
            }

            // setup initial view
            goToQuestion(questions['index'])
        })
    })
})();
