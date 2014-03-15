var x = require('xon')

module.exports = {
  getData: getData,
  init: init
}

function d(date) {
  return date.toLocaleString().split(' ')[0]
}

var descriptions = [
    "Holds the ears together",
    "Keeps the organs from falling out",
    "An ancient greek chef"
]

function getData(cb) {
  /* Add real data here
  cb(null, {
    terms: [{
      name: "The name",
      description: "This is the function",
      moreInfo: "the paragraph here.",
      images: ["src1", "src2", "src3"],
      quiz: 1, // the quiz number this belongs to
      mastered: false,
      selImage: 0
    }, {
      ...
    }],
    quizes: [{
      name: "Quiz 1 Bones",
      date: d(new Date()),
      num: 1
    }, {
      name: "Quiz 2 Muscles",
      date: d(new Date(new Date.getTime() + 3600*24*7)),
      num: 1
    }],
  }, true)
  */
  cb(null, x({
    // Mess with the fixtures here
    terms: x.some(100, {
      name: x.choice(['Skull', 'epidermis', 'epicurus', 'flaggella', 'epoxy', 'clavical', 'tonsil']),
      description: x.lipsum({count:6, units:'words'}),
      mastered: x.choice([false, true]),
      images: [
        x.image(600, 280, 'Image 1'),
        x.image(600, 280, 'Image 2'),
        x.image(600, 280, 'Image 3'),
        x.image(600, 280, 'Image 4'),
        x.image(600, 280, 'Image 5'),
        x.image(600, 280, 'Image 6')
      ],
      quiz: x.randInt(1, 4),
      selImage: 0,
      moreInfo: x.lipsum({count:5})
    }),
    quizes: [{
      name: 'Quiz 1 Bones',
      date: d(new Date()),
      num: 1
    }, {
      name: 'Quiz 2 Brains',
      date: d(new Date()),
      num: 2
    }, {
      name: 'Quiz 3',
      date: d(new Date()),
      num: 3
    }]
  }), true)
}

function init($scope, app) {
  // deal with it
  $scope.page = 'Flashcards'
  $scope.pages = ['Home', 'Quiz', 'Flashcards', 'Midterm'];
  $scope.filters = [{
    name: 'all',
    title: 'All'
  }, {
    name: 'unmastered',
    title: 'Unmastered'
  }, {
    name: 'mastered',
    title: 'Mastered'
  }]
  $scope.main = {
    search: '',
    filter: 'all'
  }
  $scope.quizStatus = {
    page: 1,
    iterm: -1
  }
  $scope.flash = {
    filter: 'all'
  }
  $scope.midtermStatus = null;
  
  $scope.switchToQuiz = function (quiz) {
    $scope.focusedQuiz = quiz;
    $scope.opened = false;
    $scope.shuffleQuiz($scope.quizStatus);
    $scope.shuffleFlashcards();
  }
  
  // flashcard stuff
  $scope.shuffleFlashcards = function () {
    $scope.flash.terms = $scope.terms.filter(function (t) {
      if (t.quiz !== $scope.focusedQuiz.num) return false
      if ($scope.flash.filter === 'all') return true
      return $scope.flash.filter === (t.mastered ? 'mastered' : 'unmastered')
    }).sort(function () {
      return .5 - Math.random()
    })
    $scope.flash.num = 0
    $scope.flash.flipped = false
    $scope.flash.term = $scope.flash.terms[$scope.flash.num]
    $scope.flash.term.selImage = parseInt(Math.random() * $scope.flash.term.images.length)
  }
  
  $scope.flashFilterBy = function (filter) {
    $scope.flash.filter = filter.name
    $scope.shuffleFlashcards()
  }
  $scope.nextFlash = function (e) {
    e.preventDefault()
    $scope.flash.num += 1
    if ($scope.flash.num >= $scope.flash.terms.length) {
      $scope.flash.num = 0
    }
    $scope.flash.term = $scope.flash.terms[$scope.flash.num]
    $scope.flash.term.selImage = parseInt(Math.random() * $scope.flash.term.images.length)
    $scope.flash.flipped = false
  }
  $scope.prevFlash = function (e) {
    e.preventDefault()
    $scope.flash.num -= 1
    if ($scope.flash.num < 0) {
      $scope.flash.num = $scope.flash.terms.length - 1
    }
    $scope.flash.term = $scope.flash.terms[$scope.flash.num]
    $scope.flash.flipped = false
  }
  $scope.toggleMasterFlash = function () {
    $scope.flash.term.mastered = !$scope.flash.term.mastered
  }
  $scope.flipFlash = function () {
    $scope.flash.flipped = true
  }
  
  // midterm stuff
  $scope.selectAllQuizes = function () {
    $scope.quizes.map(function (q) {
      q.midtermSelected = true
    })
  }
  $scope.selectNoQuizes = function () {
    $scope.quizes.map(function (q) {
      q.midtermSelected = false
    })
  }
  
  $scope.startMidterm = function () {
    $scope.midtermStatus = {
      name: null,
      description: null,
      page: 1,
      iterm: -1,
      quizes: $scope.selectedQuizes(),
      terms: $scope.midtermTerms().filter(function (t) {return !t.mastered}).sort(function () {
        return 0.5 - Math.random()
      })
    }
    $scope.nextTerm($scope.midtermStatus)
  }
  $scope.newMidterm = function () {
    $scope.midtermStatus = false
  }
  
  $scope.selectedQuizes = function () {
    return $scope.quizes.filter(function (q) {return q.midtermSelected})
  }
  
  // get all terms from the currently selected midterm
  $scope.midtermTerms = function () {
    var qmp = {}
    $scope.quizes.map(function (q) {
      qmp[q.num] = q
    })
    return $scope.terms.filter(function (t) {return qmp[t.quiz].midtermSelected})
  }
  
  // get all terms from the currently selected quiz
  $scope.currentTerms = function () {
    return $scope.terms.filter(function (t) {return t.quiz === $scope.focusedQuiz.num})
  }
  
  $scope.shuffleQuiz = function (status) {
    status.name = null;
    status.description = null;
    status.page = 1
    status.iterm = -1
    status.terms = $scope.currentTerms().filter(function (t) {return !t.mastered}).sort(function () {
      return .5 - Math.random()
    })
    $scope.nextTerm(status);
  }
  
  $scope.inputKeyDown = function (e, status) {
    if (e.keyCode !== 13) return
    e.preventDefault()
    $scope.quizCheck(status)
    return false
  }
  
  $scope.nextTerm = function (status) {
    status.iterm += 1
    if (status.iterm >= status.terms.length) {
      if (status.terms.length === 0) return// alert('Failed to load quiz. Please refresh')
      return $scope.shuffleQuiz(status)
    }
    status.term = status.terms[status.iterm]
    status.term.showImage = parseInt(Math.random() * status.term.images.length)
    status.term.testDescriptions = []
    while (status.term.testDescriptions.length < 3) {
      var term = $scope.terms[parseInt(Math.random() * $scope.terms.length)];
      if (term.description === status.term.description) continue;
      status.term.testDescriptions.push(term.description);
    }
    status.term.testDescriptions.splice(parseInt(Math.random()*3), 0, status.term.description)
    status.name = null;
    status.description = null;
    status.page = 1;
    status.hinting = false;
  }
  
  $scope.showQOverImage = function (status) {
    status.showingOverImage = true;
  }
  
  $scope.hideQOverImage = function (status) {
    status.showingOverImage = false;
  }
  
  // quiz stuff
  // Name the Picture! Page 1
  $scope.quizNewPicture = function (term) {
    var prev = term.showImage
    while (term.showImage === prev) {
      term.showImage = parseInt(Math.random() * term.images.length)
    }
  }
  $scope.quizGiveUp = function (status) {
    status.name = null
    status.page = 2
  }
  $scope.quizCheck = function (status) {
    status.page = 2
  }
  // What's the function? Page 2
  $scope.quizChooseFunction = function (status, desc) {
    status.description = desc;
    status.page = 3;
    status.hinting = false;
  }
  $scope.quizGiveUpFunction = function (status) {
    status.description = null;
    status.page = 3;
  }
  // WORK HERE
  $scope.quizHintFunction = function (status) {
    status.hinting = {}
    var i=0;
    while (i<2) {
      var z = parseInt(Math.random() * 4)
      if (status.term.testDescriptions[z] === status.term.description || status.hinting[z]) continue;
      status.hinting[z] = true;
      i++;
    }
  }
  // You're done! Page 3
  
  $scope.clearMastered = function (which) {
    if (which === 'quiz') {
    $scope.currentTerms().map(function (t) {
      t.mastered = false;
    });
    $scope.shuffleQuiz($scope.quizStatus);
    } else {
      $scope.midtermTerms().map(function (t) {
        t.mastered = false;
      });
      $scope.startMidterm();
    }
  }
  $scope.numMastered = function (which) {
    if (which === 'quiz') return $scope.terms.filter($scope.filterMastered).length
    return $scope.midtermTerms().filter(function (t){return t.mastered}).length
  }
  $scope.filterMastered = function (term) {
    return term.quiz === $scope.focusedQuiz.num && term.mastered
  }
  $scope.numTerms = function (which) {
    if (which === 'quiz') return $scope.currentTerms().length
    return $scope.midtermTerms().length
  }
  $scope.setPage = function (name) {
    $scope.page = name
  }
  $scope.filterBy = function (filter) {
    $scope.main.filter = filter.name
    $scope.moreInfo = null;
  }
  $scope.filterTerms = function (item) {
    if (item.quiz !== $scope.focusedQuiz.num) return false
    if ($scope.main.filter !== 'all' && $scope.main.filter !== (item.mastered ? 'mastered' : 'unmastered')) return false
    if ($scope.main.search.trim() === '') return true
    return item.name.toLowerCase().indexOf($scope.main.search) !== -1
  }
  $scope.filterQuiz = function (item) {
    return item.quiz === $scope.focusedQuiz.num
  }
  $scope.closeMoreInfo = function () {
    $scope.moreInfo = false;
  }
  $scope.showMoreInfo = function (term) {
    $scope.moreInfo = term;
  }
  $scope.toggleMasteredQuiz = function (term) {
    term.mastered = !term.mastered;
    $scope.shuffleFlashCards();
  }
  $scope.toggleMasteredHome = function (term) {
    $scope.toggleMastered(term);
    $scope.shuffleQuiz($scope.quizStatus);
    $scope.shuffleFlashCards();
  }
  $scope.toggleListMode = function () {
    if ($scope.listMode === 'pictures') {
      $scope.listMode = 'text';
    } else {
      $scope.listMode = 'pictures';
    }
  }
  $scope.nextImage = function (term, attr) {
    attr = attr || 'selImage'
    term[attr] += 1
    if (term[attr] >= term.images.length) {
      term[attr] = 0;
    }
  }
  $scope.prevImage = function (term, attr) {
    attr = attr || 'selImage'
    term[attr] -= 1
    if (term[attr] < 0) term[attr] = term.images.length - 1
  }
  $scope.showOverImage = function () {
    $scope.showingOverImage = true;
  }
  $scope.hideOverImage = function () {
    $scope.showingOverImage = false;
  }
  $scope.showQuizOverImage = function () {
    $scope.showingQuizOverImage = true;
  }
  $scope.hideQuizOverImage = function () {
    $scope.showingQuizOverImage = false;
  }
  $scope.switchToQuiz($scope.quizes[0]);
}

