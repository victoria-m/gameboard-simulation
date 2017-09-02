'use strict'

// define globals
const MARGIN = 60, WIDTH = 50, HEIGHT = 50, FPS = 5, DIRECTIONS = ['up', 'right', 'down', 'left']
var grid, marker, results, request, numRows, numCols

// set up the canvas and its context
var canvas = document.getElementById('canvas'), context = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight * 1.8

function main() {
  var rowSelection = document.getElementById('num-rows')
  var colSelection = document.getElementById('num-cols')
  numCols = colSelection.options[colSelection.selectedIndex].value
  numRows = rowSelection.options[rowSelection.selectedIndex].value

  // instantiate the Grid, Marker, and Results
  grid = new Grid(numRows, numCols, HEIGHT, WIDTH, MARGIN)
  marker = new Marker(0, numRows - 1)
  results = new Results()

  // initialize the animation loop
  window.requestAnimationFrame(step)
}

// define the grid
var Grid = function(numRows, numCols, height, width, margin) {
  this.numRows = numRows
  this.numCols = numCols
  this.height = height
  this.width = width
  this.margin = margin
}

Grid.prototype.draw = function(marker) {
  for (var i = 0; i < this.numCols; ++i) {
    for (var j = 0; j < this.numRows; ++j) {
      // set the default fill color:
      context.fillStyle = 'black'

      // enforce boundaries for the marker:
      if (marker.x < 0) marker.x = 0
      if (marker.y < 0) marker.y = 0
      if (marker.x > this.numCols - 1) marker.x = this.numCols - 1
      if (marker.y > this.numRows - 1) marker.y = this.numRows - 1

      // set the marker fill color:
      if (marker.x == i && marker.y == j) {
        context.fillStyle = 'red'
      }

      // fill the current rectangle:
      context.fillRect(i * this.margin, j * this.margin, this.width, this.height)
    }
  }
}

// define Marker
var Marker = function(x, y) {
  this.x = x
  this.y = y
  this.direction = ""
  this.steps = 0
  this.moving = true
  this.history = []

  // placing the marker counts as a touch
  this.history.push(new Cell(this.x, this.y))
}

Marker.prototype.prepareForMove = function() {
  // Step 1: generate direction
  this.direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
  ++results.stepOneExecs

  // Step 2: generate step from 0 to 2
  this.steps = Math.floor(Math.random() * 3)
}

Marker.prototype.move = function() {
  this.prepareForMove()

  // Step 3: try to move the marker
  switch (this.direction) {
  case 'up':
    if (this.y - this.steps >= 0) this.y -= this.steps
    break
  case 'right':
    if (this.x + this.steps < grid.numCols) this.x += this.steps
    break
  case 'down':
    if (this.y + this.steps < grid.numRows) this.y += this.steps
    break
  case 'left':
    if (this.x - this.steps >= 0) this.x -= this.steps
    break
  }

  // check if game ended
  if (this.x == grid.numCols - 1 && this.y == 0) {
    results.gameEndReason = "Marker touched right corner"
    this.moving = false
  }
  else if (results.stepOneExecs > results.MAX_STEP_ONE_EXECS) {
    results.gameEndReason = "Exceeded max number of step one executions"
    this.moving = false
  }

  // push to marker's move history if its position changes
  if ((this.history[this.history.length - 1].x != this.x) || (this.history[this.history.length - 1].y != this.y)) {
    this.history.push(new Cell(Math.abs(this.x), Math.abs(this.y)))
  }

}

// define Cell
function Cell(x, y) {
  this.x = x
  this.y = y
}

// describe a frame step
function step() {
  setTimeout(function() {
    request = requestAnimationFrame(step)

    if (marker.moving) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      marker.move()
      grid.draw(marker)
    } else {
      window.cancelAnimationFrame(request)
      results.process()
      results.output(document.getElementById('results'))
    }
  }, 1000 / FPS)
}

// populate the Select elements with options
function fillDropdowns() {
  const MIN_DIMENSIONS = 5, MAX_DIMENSIONS = 20
  var rowSelect = document.getElementById('num-rows'), colSelect = document.getElementById('num-cols')

  // fill each select list with options ranging from min to max grid dimensions
  for (var i = MIN_DIMENSIONS; i <= MAX_DIMENSIONS; ++i) {
    rowSelect.options[rowSelect.options.length] = new Option(i, i)
    colSelect.options[colSelect.options.length] = new Option(i, i)
  }

}

function Results() {
  this.gameEndReason = ""
  this.stepOneExecs = 0
  this.MAX_STEP_ONE_EXECS = 1000000
  this.cellTouches = new Array()
  this.maxTouches = 0
  this.minTouches = 0
  this.avgTouches = 0
}

Results.prototype.process = function() {
  // build the cell touches grid, fill it with 0's
  for (var i = 0; i < grid.numRows; ++i) {
    this.cellTouches[i] = new Array()
    for (var j = 0; j < grid.numCols; ++j) { this.cellTouches[i][j] = 0 }
  }

  // increment cell touches grid's indices for every set of marker coordinates
  for (var i = 0; i < marker.history.length; ++i) { ++this.cellTouches[marker.history[i].x][marker.history[i].y] }

  // get min, max, avg
  var sum = 0

  // initialize min to one of the cell touch values
  this.minTouches = this.cellTouches[0][0]

  for (var i = 0; i < this.cellTouches.length; ++i) {
    for (var j = 0; j < this.cellTouches[i].length; ++j) {
      if (this.cellTouches[i][j] > this.maxTouches) this.maxTouches = this.cellTouches[i][j]
      if (this.cellTouches[i][j] < this.minTouches) this.minTouches = this.cellTouches[i][j]
      sum += this.cellTouches[i][j]
    }
  }

  this.avgTouches = sum / (grid.numRows * grid.numCols)
}

Results.prototype.toHtml = function() {
  return "<h3>Number of step one executions</h3><p>" + this.stepOneExecs + "</p>\
          <h3>Reason why game ended</h3><p>" + this.gameEndReason + "</p>\
          <h3>Grid indicating number of times each cell was touched</h3>" + this.toHtmlTable(this.cellTouches) + "\
          <h3>Maximum number of touches for any cell</h3><p>" + this.maxTouches + "</p>\
          <h3>Minimum number of touches for any cell</h3><p>" + this.minTouches + "</p>\
          <h3>Average number of touches for any cell</h3><p>" + this.avgTouches + "</p>"
}

Results.prototype.toHtmlTable = function() {
  var table = "<table>"

  for (var i = 0; i < this.cellTouches.length; ++i) {
    table += "<tr>"
    for (var j = 0; j < this.cellTouches[i].length; ++j) { table += "<td>" + this.cellTouches[i][j] + "</td>" }
    table += "</tr>"
  }
  return table += "</table>"
}

Results.prototype.output = function(element) { element.innerHTML = this.toHtml() }
