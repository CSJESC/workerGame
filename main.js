(function () {
  "use strict"

  // from https://github.com/kvz/phpjs/blob/master/functions/strings/nl2br.js
  var nl2br = function  (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  }

  // get the data
  $.getJSON( "./data/gameData.json", function(data) {
    var status    = data.status
    ,   questions = data.questions

    // add poisbility to link to winner 
    questions.winner = {
      isWinner: true
    }

    // when dom is ready
    $(function() {
      // find the dom elements
      var $containerElem = $('.container')
      ,   $moneyElem     = $('.status-bar .money')
      ,   $energyElem    = $('.status-bar .energy')
      ,   $textElem      = $('.text')
      ,   $yesButton     = $('.yes-button')
      ,   $noButton      = $('.no-button')
      ,   $bothButtons   = $yesButton.add($noButton)

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
        $containerElem.css({
          'background-image': 'url(img/'+ question.image +')',
        });
        $textElem.html(nl2br(question.text))
        $moneyElem.text(status.money)
        $energyElem.text(status.energy)
        // set button text if specified, if not use standard
        $yesButton.text(question.yes.text || 'yes')
        $noButton.text(question.no.text || 'no')

        // set actions for answers
        $bothButtons.unbind('click')
        $bothButtons.click(function(event) {
          var answer
          if (event.target.dataset.answer == 'yes')
            answer = question.yes
          else
            answer = question.no

          status.money  += answer.money
          status.energy += answer.energy

          goToQuestion(questions[answer.next])
        });
      }

      // setup initial view
      goToQuestion(questions['start'])
    })
  })
})()
