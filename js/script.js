const SIZE = 10
var gameboard
var gameResults

function start() {
  gameResults = new GameResults()
  gameboard = new GameBoard(SIZE)

  gameboard.startGame()
  console.log(gameboard.grid)

  // move code below to write()
  var gameResultsDiv = document.getElementById('game-results')

  // output results
  gameResultsDiv.innerHTML = gameResults.display()
}

function writeResults() {

}

function GameResults() {
  // PROPERTIES:

  this.reasonWhyGameEnded = ""
  this.numberOfStepOneExecutions = 0

  // multi-dimensional array containing the number of times each cell was touched
  this.cellTouchesGrid = new Array(SIZE)

  // initialize the array with 0's
  for (var row = 0; row < SIZE; ++row) {
    this.cellTouchesGrid[row] = new Array()

    for (var col = 0; col < SIZE; ++col) {
      this.cellTouchesGrid[row][col] = 0
    }
  }

  this.maxNumberOfCellTouches = 0
  this.minNumberOfCellTouches = 0
  this.avgNumberOfCellTouches = 0

  // METHODS:

  this.display = function() {
    return "<h4>Number of step one executions</h4><p>" + this.numberOfStepOneExecutions + "</p>\
            <h4>Reason why game ended</h4><p>" + this.reasonWhyGameEnded + "</p>\
            <h4>Grid indicating number of times each cell was touched</h4>" + this.generateHtmlTable(this.cellTouchesGrid) + "\
            <h4>Maximum number of touches for any cell</h4><p>" + this.maxNumberOfCellTouches + "</p>\
            <h4>Minimum number of touches for any cell</h4><p>" + this.minNumberOfCellTouches + "</p>\
            <h4>Average number of touches for any cell</h4><p>" + this.avgNumberOfCellTouches + "</p>"
  }

  this.generateHtmlTable = function(array) {

    var arrayHtml = "<table>"

    for (var row in array) {
      arrayHtml += "<tr>"
      for (var col in array) {
        arrayHtml += "<td>" + array[row][col] + "</td>"
      }
      arrayHtml += "</tr>"
    }

    arrayHtml += "</table>"
    return arrayHtml
  }

  this.updateCellTouchesGrid = function(x, y) {
    this.cellTouchesGrid[x][y] += 1

    // update the min and max number of touches
    this.updateMaxNumberOfCellTouches(this.cellTouchesGrid[x][y])
    this.updateMinNumberOfCellTouches()
  }

  this.updateMaxNumberOfCellTouches = function(mostRecentCellTouchValue) {
    // update max number of cell touches if less than most recent cell touch value
    if (this.maxNumberOfCellTouches < mostRecentCellTouchValue) this.maxNumberOfCellTouches = mostRecentCellTouchValue
  }

  this.updateMinNumberOfCellTouches = function() {
    var min = this.cellTouchesGrid[0][0]

    // search for a new min every time since number of times touched for each cell increases for each move
    for (var row in this.cellTouchesGrid) {
      for (var col in this.cellTouchesGrid) {
        if (this.cellTouchesGrid[row][col] < min) min = this.cellTouchesGrid[row][col]
      }
    }

    // finally, update the game results min value
    this.minNumberOfCellTouches = min
  }

  // computed when game ends
  this.updateAvgNumberOfCellTouches = function() {
    var totalNumberOfTouches = 0
    var totalNumberOfCells = SIZE * SIZE

    for (var row in this.cellTouchesGrid) {
      for (var col in this.cellTouchesGrid) {
        totalNumberOfTouches += this.cellTouchesGrid[row][col]
      }
    }

    this.avgNumberOfCellTouches = (totalNumberOfTouches / totalNumberOfCells)
  }
}

function Cell(x, y) {
  this.x = x
  this.y = y
}

function GameBoard(size) {
  // PROPERTIES:
  this.size = size

  // build the NxN multi-dimensional grid
  this.grid = new Array(this.size)

  for (var row = 0; row < size; ++row) {
    this.grid[row] = new Array()

    for (var col = 0; col < size; ++col) {
      this.grid[row][col] = new Cell(row, col)
    }
  }

  // set the starting position to the lower left-hand cell
  this.currentPosition = new Cell(this.size - 1, 0)
  gameResults.updateCellTouchesGrid(this.size - 1, 0)

  // indicates whether the game is running or stopped
  this.running = false

  // maximum number of step one executions allowed, used when checking if game should end
  const MAX_NUM_STEP_ONE_EXECUTIONS_ALLOWED = 1000000

  // METHODS:
  this.move = function() {
    // step 1 - generate a random direction
    var direction = this.generateRandomDirection()
    // game results - increase number of step 1 executions
    gameResults.numberOfStepOneExecutions += 1

    // step 2 - generate a random number of steps
    var numberOfSteps = this.generateRandomNumberOfSteps()

    // step 3 - if the move is possible and update the grid position
    switch (direction) {
      case 'up':
        if ((this.currentPosition.x - numberOfSteps) >= 0) {
          this.updateCurrentPosition((this.currentPosition.x - numberOfSteps), this.currentPosition.y)
        }
        break
      case 'right':
        if ((this.currentPosition.y + numberOfSteps) <= (this.size - 1)) {
          this.updateCurrentPosition(this.currentPosition.x, (this.currentPosition.y + numberOfSteps))
        }
        break
      case 'down':
        if ((this.currentPosition.x + numberOfSteps) <= (this.size - 1)) {
          this.updateCurrentPosition((this.currentPosition.x + numberOfSteps), this.currentPosition.y)
        }
        break
      case 'left':
        if ((this.currentPosition.y - numberOfSteps) >= 0) {
          this.updateCurrentPosition(this.currentPosition.x, (this.currentPosition.y - numberOfSteps))
        }
        break
    }

    // step 4 - check if we won (if the new position is the upper right-hand corner of the grid
    if ((this.currentPosition.x == 0) && (this.currentPosition.y == (this.size - 1))) {
      gameResults.reasonWhyGameEnded = "Reached upper right-hand corner of the grid"
      this.stopGame()
    }
    // OR number of step one executions > max allowed
    else if (gameResults.numberOfStepOneExecutions > MAX_NUM_STEP_ONE_EXECUTIONS_ALLOWED) {
      gameResults.reasonWhyGameEnded = "Number of step one executions exceeded" + MAX_NUM_STEP_ONE_EXECUTIONS_ALLOWED
      this.stopGame()
    }

    console.log(this.currentPosition)
    console.log("moved " + direction + " " + numberOfSteps + " steps")
  }

  this.updateCurrentPosition = function(x, y) {
    this.currentPosition = new Cell(x, y)

    gameResults.updateCellTouchesGrid(x, y)
  }

  this.generateRandomDirection = function() {
    var directions = ['up', 'right', 'down', 'left']

    // get random direction from the array
    return directions[Math.floor(Math.random() * directions.length)]
  }

  this.generateRandomNumberOfSteps = function() {
    var steps = [0, 1, 2]

    return steps[Math.floor(Math.random() * steps.length)]
  }

  this.stopGame = function() {
    gameResults.updateAvgNumberOfCellTouches()

    this.running = false
  }

  this.startGame = function() {
    this.running = true

    // move the marker until game ends
    while(this.running) {
      this.move()
    }
  }

}
