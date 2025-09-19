document.addEventListener('DOMContentLoaded', () => {
  const GRID_WIDTH = 35
  const GRID_HEIGHT = 15

  // --- Node Default Positions ---
  let START_NODE_ROW = 7
  let START_NODE_COL = 5
  let END_NODE_ROW = 7
  let END_NODE_COL = 29

  const gridContainer = document.getElementById('grid-container')
  let grid = []
  let isMouseDown = false
  let isVisualizing = false
  let isPaused = false
  let nodeBeingDragged = null
  const tooltip = document.getElementById('pathfinder-tooltip')
  const pauseResumeBtn = document.getElementById('pause-resume-btn')

  // --- Node Class ---
  let animationTimer = null

  /**
   * Represents a single cell (node) in the grid. It holds its position,
   * state (start, end, wall), and properties for the A* algorithm.
   * @class
   * @param {number} row - The row index of the node.
   * @param {number} col - The column index of the node.
   */
  class Node {
    constructor (row, col) {
      this.row = row
      this.col = col
      this.isStart = row === START_NODE_ROW && col === START_NODE_COL
      this.isEnd = row === END_NODE_ROW && col === END_NODE_COL
      this.isWall = false
      // Properties for A* algorithm
      this.fScore = Infinity // Total estimated cost (gScore + hScore)
      this.gScore = Infinity // Cost from start to current node
      this.isVisited = false
      this.previousNode = null
      // The DOM element associated with this node
      this.element = document.createElement('div')
      this.element.className = 'node'
      this.element.id = `node-${row}-${col}`
    }
  }

  /**
   * A Min-Heap implementation of a Priority Queue.
   * This is a crucial optimization for the A* algorithm, allowing for
   * efficient retrieval of the node with the lowest fScore.
   * @class
   */
  class PriorityQueue {
    /**
     * @param {function} comparator - A function to determine the priority of elements.
     * Defaults to a standard greater-than comparison for a min-heap.
     */
    constructor (comparator = (a, b) => a > b) {
      this._heap = []
      this._comparator = comparator
    }

    /** @returns {number} The number of elements in the queue. */
    size () {
      return this._heap.length
    }

    /** @returns {boolean} True if the queue is empty. */
    isEmpty () {
      return this.size() === 0
    }

    /** @returns {*} The element with the highest priority without removing it. */
    peek () {
      return this._heap[0]
    }

    /**
     * Adds a value to the queue and maintains the heap property.
     * @param {*} value - The value to push.
     */
    push (value) {
      this._heap.push(value)
      this._siftUp()
    }

    /**
     * Removes and returns the element with the highest priority.
     * @returns {*} The popped value.
     */
    pop () {
      const poppedValue = this.peek()
      const bottom = this.size() - 1
      if (bottom > 0) {
        this._swap(0, bottom)
      }
      this._heap.pop()
      this._siftDown()
      return poppedValue
    }

    /**
     * Swaps two elements in the heap.
     * @private
     */
    _swap (i, j) {
      ;[this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]]
    }

    /**
     * Moves a new element up the heap to its correct position.
     * @private
     */
    _siftUp () {
      let nodeIdx = this.size() - 1
      while (
        nodeIdx > 0 &&
        this._compare(nodeIdx, Math.floor((nodeIdx - 1) / 2))
      ) {
        const parentIdx = Math.floor((nodeIdx - 1) / 2)
        this._swap(nodeIdx, parentIdx)
        nodeIdx = parentIdx
      }
    }

    /**
     * Moves the root element down the heap to its correct position after a pop.
     * @private
     */
    _siftDown () {
      let nodeIdx = 0
      while (
        (nodeIdx * 2 + 1 < this.size() &&
          this._compare(nodeIdx * 2 + 1, nodeIdx)) ||
        (nodeIdx * 2 + 2 < this.size() &&
          this._compare(nodeIdx * 2 + 2, nodeIdx))
      ) {
        const greaterChildIdx =
          nodeIdx * 2 + 2 < this.size() &&
          this._compare(nodeIdx * 2 + 2, nodeIdx * 2 + 1)
            ? nodeIdx * 2 + 2
            : nodeIdx * 2 + 1
        this._swap(nodeIdx, greaterChildIdx)
        nodeIdx = greaterChildIdx
      }
    }

    /**
     * Compares two elements in the heap based on the comparator function.
     * @private
     */
    _compare (i, j) {
      return this._comparator(this._heap[i], this._heap[j])
    }
  }

  /**
   * A custom Timer class to manage pausable, scheduled animations.
   * This allows the visualization to be paused and resumed without losing its state.
   * @class
   */
  class Timer {
    constructor () {
      this.tasks = []
      this.isPaused = false
    }

    /**
     * Schedules a callback function to be executed after a specified delay.
     * @param {function} callback - The function to execute.
     * @param {number} delay - The delay in milliseconds.
     */
    schedule (callback, delay) {
      const task = {
        callback,
        executionTime: Date.now() + delay,
        timeoutId: null
      }
      this.tasks.push(task)
      if (!this.isPaused) {
        this._scheduleTask(task)
      }
    }

    /**
     * Sets the timeout for a specific task.
     * @private
     */
    _scheduleTask (task) {
      const delay = task.executionTime - Date.now()
      task.timeoutId = setTimeout(() => {
        task.callback()
        this.tasks = this.tasks.filter(t => t !== task)
      }, Math.max(0, delay))
    }

    /**
     * Pauses all scheduled tasks.
     */
    pause () {
      this.isPaused = true
      this.tasks.forEach(task => clearTimeout(task.timeoutId))
    }

    /**
     * Resumes all paused tasks.
     */
    resume () {
      this.isPaused = false
      this.tasks.forEach(task => {
        task.executionTime = Math.max(task.executionTime, Date.now()) // Reschedule for now if time has passed
        this._scheduleTask(task)
      })
    }

    /**
     * Clears all scheduled tasks.
     */
    clear () {
      this.tasks.forEach(task => clearTimeout(task.timeoutId))
      this.tasks = []
    }
  }
  /**
   * Initializes or resets the grid, creating all Node objects and
   * attaching their corresponding DOM elements and event listeners.
   */
  function initializeGrid () {
    if (!gridContainer) return // Guard clause if element doesn't exist
    gridContainer.innerHTML = ''
    // Clear any existing animation classes from nodes if they exist
    const nodes = gridContainer.querySelectorAll('.node')
    nodes.forEach(node => {
      node.classList.remove('node-pop', 'node-path')
    })

    grid = []
    isPaused = false
    if (pauseResumeBtn) pauseResumeBtn.style.display = 'none'
    isVisualizing = false // Reset visualization state
    gridContainer.style.setProperty('--grid-width', GRID_WIDTH)
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 1fr)`

    for (let row = 0; row < GRID_HEIGHT; row++) {
      const currentRow = []
      for (let col = 0; col < GRID_WIDTH; col++) {
        const node = new Node(row, col)
        // Add appropriate classes for start/end nodes
        if (node.isStart) {
          node.element.classList.add('node-start')
        } else if (node.isEnd) {
          node.element.classList.add('node-end')
        }

        addEventListenersToNode(node)
        gridContainer.appendChild(node.element)
        currentRow.push(node)
      }
      grid.push(currentRow)
    }
  }

  /**
   * Adds all necessary mouse event listeners to a node's DOM element
   * for interaction (drawing walls, dragging start/end points, showing tooltips).
   * @param {Node} node - The node to attach listeners to.
   */
  function addEventListenersToNode (node) {
    node.element.addEventListener('mouseover', e => {
      if (!tooltip || !gridContainer) return

      let content = `<strong>Node (${node.row}, ${node.col})</strong>`
      if (node.fScore !== Infinity) {
        const hScore = node.fScore - node.gScore
        content += `<br>
          gScore: ${node.gScore}<br>
          hScore: ${hScore.toFixed(2)}<br>
          fScore: ${node.fScore.toFixed(2)}
        `
      }
      tooltip.innerHTML = content

      // Make the tooltip visible but off-screen to measure its dimensions
      tooltip.style.display = 'block'
      tooltip.style.left = '-9999px'

      // Position the tooltip relative to the grid container to avoid overflow
      const gridRect = gridContainer.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      const mouseX = e.clientX - gridRect.left
      const mouseY = e.clientY - gridRect.top

      // Check if the tooltip would overflow on the right side of the grid container
      if (mouseX + 15 + tooltipRect.width > gridRect.width) {
        // If it would, position it to the left of the cursor
        tooltip.style.left = `${mouseX - tooltipRect.width - 15}px`
      } else {
        // Otherwise, position it to the right
        tooltip.style.left = `${mouseX + 15}px`
      }
      tooltip.style.top = `${mouseY + 15}px`
    })

    node.element.addEventListener('mouseout', () => {
      if (tooltip) {
        tooltip.style.display = 'none'
      }
    })

    node.element.addEventListener('mousedown', e => {
      e.preventDefault() // Prevent default drag behavior
      if (isVisualizing) return

      if (node.isStart || node.isEnd) {
        nodeBeingDragged = node
      } else {
        isMouseDown = true
        node.isWall = !node.isWall
        node.element.classList.toggle('node-wall', node.isWall)
      }
    })

    node.element.addEventListener('mouseenter', () => {
      if (isVisualizing) return

      if (nodeBeingDragged && node !== nodeBeingDragged && !node.isWall) {
        // We are dragging a start/end node to a new location
        const isStartNodeDrag = nodeBeingDragged.isStart

        // Update the old node
        nodeBeingDragged.isStart = false
        nodeBeingDragged.isEnd = false
        nodeBeingDragged.element.classList.remove('node-start', 'node-end')

        // Update the new node
        if (isStartNodeDrag) {
          node.isStart = true
          node.element.classList.add('node-start')
          START_NODE_ROW = node.row
          START_NODE_COL = node.col
        } else {
          node.isEnd = true
          node.element.classList.add('node-end')
          END_NODE_ROW = node.row
          END_NODE_COL = node.col
        }
        nodeBeingDragged = node // The node we are over is now the one being dragged
      } else if (isMouseDown && !node.isStart && !node.isEnd) {
        // We are drawing walls
        node.isWall = !node.isWall
        node.element.classList.toggle('node-wall', node.isWall)
      }
    })
  }

  /**
   * A global mouseup listener to stop any drawing or dragging action
   * when the mouse button is released anywhere on the page.
   */
  document.addEventListener('mouseup', () => {
    isMouseDown = false
    nodeBeingDragged = null
  })

  // --- Pathfinding Algorithm ---

  /**
   * Kicks off the A* visualization. It resets the grid state,
   * initializes the animation timer, and calls the main A* function.
   */
  function visualizeAlgorithm () {
    if (isVisualizing) return
    isVisualizing = true
    isPaused = false
    pauseResumeBtn.textContent = 'Pause'
    pauseResumeBtn.style.display = 'inline-block'
    animationTimer = new Timer()

    // Clear previous visualizations
    for (const row of grid) {
      for (const node of row) {
        if (!node.isStart && !node.isEnd && !node.isWall) {
          node.element.classList.remove('node-pop', 'node-path')
          node.element.style.backgroundColor = '' // Clear inline styles
        }
        // Reset algorithm-specific properties
        node.fScore = Infinity
        node.gScore = Infinity
        node.isVisited = false // Reset for all nodes to ensure a clean slate
        node.previousNode = null
      }
    }

    const startNode = grid[START_NODE_ROW][START_NODE_COL]
    const endNode = grid[END_NODE_ROW][END_NODE_COL]

    visualizeAStar(startNode, endNode)
  }

  /**
   * The core A* pathfinding algorithm implementation.
   * It uses a PriorityQueue to efficiently explore the grid and find the shortest path.
   * @param {Node} startNode - The starting node.
   * @param {Node} endNode - The target node.
   */
  function visualizeAStar (startNode, endNode) {
    // The comparator now checks hScore as a tie-breaker if fScores are equal.
    const priorityQueue = new PriorityQueue((a, b) => {
      if (a.fScore !== b.fScore) return a.fScore < b.fScore
      return a.fScore - a.gScore < b.fScore - b.gScore // Compare hScores
    })

    // Track min/max scores for dynamic normalization
    let minFScore = Infinity
    let maxFScore = 0

    startNode.gScore = 0
    startNode.fScore = heuristic(startNode, endNode)
    priorityQueue.push(startNode)

    let delay = 0
    while (!priorityQueue.isEmpty()) {
      const currentNode = priorityQueue.pop()

      // A node is only truly "visited" when it's popped from the queue for processing.
      if (currentNode.isVisited || currentNode.isWall) continue
      currentNode.isVisited = true

      if (currentNode === endNode) {
        animationTimer.schedule(() => animateShortestPath(endNode), 20 * delay)
        return
      }

      const neighbors = getUnvisitedNeighbors(currentNode, grid)
      for (const neighbor of neighbors) {
        // If the neighbor is a wall, skip it entirely.
        if (neighbor.isWall) continue

        const tentativeGScore = currentNode.gScore + 1

        if (tentativeGScore < neighbor.gScore) {
          neighbor.previousNode = currentNode
          neighbor.gScore = tentativeGScore
          neighbor.fScore = neighbor.gScore + heuristic(neighbor, endNode)

          // Update min/max scores for normalization
          minFScore = Math.min(minFScore, neighbor.fScore)
          maxFScore = Math.max(maxFScore, neighbor.fScore)

          if (!neighbor.isStart && !neighbor.isEnd) {
            // Animate and color the node at the same time
            animationTimer.schedule(() => {
              neighbor.element.classList.add('node-pop')
              // Normalize the score to a 0-1 range based on current min/max
              const range = maxFScore - minFScore
              const normalizedScore =
                range > 0 ? (neighbor.fScore - minFScore) / range : 0
              const lightness = 90 - normalizedScore * 60 // Map 0-1 to 90%-30% lightness
              neighbor.element.style.backgroundColor = `hsl(210, 100%, ${lightness}%)`
            }, 30 * delay) // Increased delay from 20 to 30
          }
          priorityQueue.push(neighbor)
        }
      }
      // Increment delay after processing all neighbors of a node
      delay++
    }
    // No path found
    pauseResumeBtn.style.display = 'none'
    isVisualizing = false
  }

  /**
   * The heuristic function for the A* algorithm. It estimates the "cost" to
   * get from one node to the end node. This implementation uses the
   * Manhattan distance, which is suitable for grids where only cardinal
   * movement (up, down, left, right) is allowed.
   * @param {Node} nodeA - The current node.
   * @param {Node} nodeB - The end node.
   * @returns {number} The estimated distance.
   */
  function heuristic (nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
  }

  /**
   * Retrieves the valid, unvisited neighbors of a given node.
   */
  function getUnvisitedNeighbors (node, grid) {
    const neighbors = []
    const { col, row } = node
    if (row > 0) neighbors.push(grid[row - 1][col])
    if (row < GRID_HEIGHT - 1) neighbors.push(grid[row + 1][col])
    if (col > 0) neighbors.push(grid[row][col - 1])
    if (col < GRID_WIDTH - 1) neighbors.push(grid[row][col + 1])
    return neighbors
  }

  // --- Animation Function ---

  /**
   * Animates the final shortest path by backtracking from the end node
   * to the start node using the `previousNode` references.
   */
  function animateShortestPath (endNode) {
    const nodesInShortestPathOrder = []
    let currentNode = endNode
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode)
      currentNode = currentNode.previousNode
    }
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      animationTimer.schedule(() => {
        const node = nodesInShortestPathOrder[i]
        if (!node.isStart && !node.isEnd) {
          node.element.classList.add('node-path')
          // Use inline style to override the HSL background from the search animation
          node.element.style.backgroundColor = '#ffeb3b' // Yellow path color
        }
        // When the last path node is animated, hide the pause button
        if (i === nodesInShortestPathOrder.length - 1) {
          if (pauseResumeBtn) pauseResumeBtn.style.display = 'none'
          isVisualizing = false
        }
      }, 75 * i) // Increased delay from 50 to 75
    }
  }

  // --- Control Button Event Listeners ---
  const startBtn = document.getElementById('start-visualize-btn')
  if (startBtn) {
    startBtn.addEventListener('click', visualizeAlgorithm)
  }

  const resetGridBtn = document.getElementById('reset-grid-btn')
  if (resetGridBtn) {
    resetGridBtn.addEventListener('click', () => {
      if (animationTimer) animationTimer.clear()
      initializeGrid()
    })
  }

  if (pauseResumeBtn) {
    pauseResumeBtn.addEventListener('click', () => {
      if (!isVisualizing || !animationTimer) return
      isPaused = !isPaused
      pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause'
      if (isPaused) {
        animationTimer.pause()
      } else {
        animationTimer.resume()
      }
    })
  }

  const clearWallsBtn = document.getElementById('clear-walls-btn')
  if (clearWallsBtn) {
    clearWallsBtn.addEventListener('click', () => {
      if (isVisualizing) return
      for (const row of grid) {
        for (const node of row) {
          if (node.isWall) {
            node.isWall = false
            node.element.classList.remove('node-wall')
          }
        }
      }
    })
  }

  const clearPathBtn = document.getElementById('clear-path-btn')
  if (clearPathBtn) {
    clearPathBtn.addEventListener('click', () => {
      if (isVisualizing) {
        if (animationTimer) animationTimer.clear()
        isVisualizing = false
        isPaused = false
        if (pauseResumeBtn) pauseResumeBtn.style.display = 'none'
      }
      for (const row of grid) {
        for (const node of row) {
          if (!node.isStart && !node.isEnd && !node.isWall) {
            node.element.classList.remove(
              'node-pop',
              'node-path',
              'node-gradient'
            )
            node.element.style.backgroundColor = ''
          }
          node.isVisited = false
          node.previousNode = null
        }
      }
    })
  }

  // --- Modal Control ---
  const pathfinderModal = document.getElementById('pathfinderModal')
  const launchBtn = document.getElementById('launchPathfinderBtn')

  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      pathfinderModal.style.display = 'flex'
      // Find the close button *after* the modal is displayed
      const closeBtn = pathfinderModal.querySelector('.pathfinder-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          if (animationTimer) animationTimer.clear();
          pathfinderModal.style.display = 'none';
        });
      }
      if (grid.length === 0) {
        initializeGrid()
      }
    })
  }
})