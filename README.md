# gameboard-simulation

## Summary
Pretend there is a 10 by 10 grid sketched out on a metal wall. You place a red magnetic marker on the grid and move it around following a series of steps.

`gameboard-simulation` animates this scenario, updating the gameboard each time the marker is moved and displaying results when the game ends. The marker is placed at the lower left corner of the board and the game ends once the marker reaches the upper right corner or step 1 (see Steps) has been repeated over a million times.

## Website
https://victoria-m.github.io/gameboard-simulation/index.html

## How to Start
Input your desired number of rows and columns for the gameboard dimensions (which are set to 5 by default), and click **Start Game**.

## Steps
1. Randomly choose a `direction`: up, down, left, or right. Each direction should be equally likely to be chosen. This is accomplished in the Marker object's `prepareForMove` method.

2. Randomly choose a number of `steps`, either 0, 1, or 2. Each of these should be equally likely over the long haul. Similarly to `direction`, this is done in the `Marker`'s' `prepareForMove` method.

3. The `Marker` object's `direction` and `steps` properties give us information about where the marker will move next.

4. Try to move the red marker using `Marker`'s `move` method. If that move would take you off the grid, go back to Step 1 without moving the marker. Store each successful move's coordinates within a `Cell` object inside `Marker`'s' `history` array.

## Results
After the simulation is complete, the following will be displayed below the animation:

- Number of step one executions
- Reason why game ended
- Grid indicating number of times each cell was touched
- Maximum number of touches for any cell
- Minimum number of touches for any cell
- Average number of touches for any cell

This information is contained within a `Result` object.
