
"use strict";

const form = document.getElementById("tankForm");
const input = document.getElementById("heightsInput");
const exampleBtn = document.getElementById("exampleBtn");
const errorMessage = document.getElementById("errorMessage");
const chartContainer = document.getElementById("chartContainer");

const exampleHeights = [0, 4, 0, 0, 0, 6, 0, 6, 4, 0];

function calculateWater(heights) {
  const n = heights.length;
  const leftMax = Array(n).fill(0);
  const rightMax = Array(n).fill(0);
  const water = Array(n).fill(0);

  let maxLeft = 0;
  let maxRight = 0;

  for (let i = 0; i < n; i++) {
    maxLeft = Math.max(maxLeft, heights[i]);
    leftMax[i] = maxLeft;
  }

  for (let i = n - 1; i >= 0; i--) {
    maxRight = Math.max(maxRight, heights[i]);
    rightMax[i] = maxRight;
  }

  let total = 0;

  for (let i = 0; i < n; i++) {
    water[i] = Math.max(
      0,
      Math.min(leftMax[i], rightMax[i]) - heights[i]
    );

    total += water[i];
  }

  return { water, total };
}

function parseHeights(value) {
  const parts = value.split(",").map((part) => part.trim());

  if (
    parts.length === 0 ||
    parts.some((part) => part === "" || !/^\d+$/.test(part))
  ) {
    throw new Error(
      "Enter non-negative whole numbers separated by commas."
    );
  }

  const heights = parts.map(Number);

  if (heights.length < 3) {
    throw new Error("Please enter at least 3 block heights.");
  }

  if (heights.length > 100) {
    throw new Error("Please enter no more than 100 block heights.");
  }

  if (heights.some((height) => !Number.isSafeInteger(height))) {
    throw new Error("Each height must be a safe integer.");
  }

  if (heights.some((height) => height > 100)) {
    throw new Error("Each height must be 100 or less.");
  }

  return heights;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    name
  );

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

function drawTank(heights, water) {
  const maxHeight = Math.max(1, ...heights);
  const n = heights.length;

  const cellWidth = 48;
  const cellHeight = 30;
  const paddingLeft = 42;
  const paddingTop = 24;
  const paddingBottom = 36;

  const chartWidth = paddingLeft + n * cellWidth + 12;
  const chartHeight =
    paddingTop + maxHeight * cellHeight + paddingBottom;

  const svg = svgElement("svg", {
    viewBox: `0 0 ${chartWidth} ${chartHeight}`,
    role: "img",
    "aria-label": `Water tank with ${n} blocks, storing ${
      water.reduce((sum, value) => sum + value, 0)
    } units of water`,
  });

  const title = svgElement("title");
  title.textContent = "Water tank block and water visualization";
  svg.appendChild(title);

  // Horizontal height grid and labels.
  for (let level = 0; level <= maxHeight; level++) {
    const y = paddingTop + (maxHeight - level) * cellHeight;

    svg.appendChild(
      svgElement("line", {
        x1: paddingLeft,
        y1: y,
        x2: paddingLeft + n * cellWidth,
        y2: y,
        stroke: "#e5e9ef",
        "stroke-width": 1,
      })
    );

    const label = svgElement("text", {
      x: paddingLeft - 10,
      y: y + 4,
      fill: "#778294",
      "font-size": 10,
      "text-anchor": "end",
    });

    label.textContent = String(level);
    svg.appendChild(label);
  }

  for (let i = 0; i < n; i++) {
    const x = paddingLeft + i * cellWidth;

    // Water cells appear above each solid block.
    for (let level = heights[i]; level < heights[i] + water[i]; level++) {
      const y = paddingTop + (maxHeight - level - 1) * cellHeight;

      svg.appendChild(
        svgElement("rect", {
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          fill: "#16a9df",
          stroke: "#ffffff",
          "stroke-width": 1,
        })
      );
    }

    // Solid block cells.
    for (let level = 0; level < heights[i]; level++) {
      const y = paddingTop + (maxHeight - level - 1) * cellHeight;

      svg.appendChild(
        svgElement("rect", {
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          fill: "#8b6545",
          stroke: "#ffffff",
          "stroke-width": 1,
        })
      );
    }

    const indexLabel = svgElement("text", {
      x: x + cellWidth / 2,
      y: paddingTop + maxHeight * cellHeight + 20,
      fill: "#566173",
      "font-size": 10,
      "text-anchor": "middle",
    });

    indexLabel.textContent = String(i);
    svg.appendChild(indexLabel);
  }

  chartContainer.replaceChildren(svg);
}

function renderResults(heights) {
  const result = calculateWater(heights);

  drawTank(heights, result.water);

  document.getElementById("waterTotal").textContent =
    String(result.total);

  document.getElementById("totalBlocks").textContent =
    String(heights.length);

  document.getElementById("maxHeight").textContent =
    String(Math.max(...heights));

  document.getElementById("blockCount").textContent =
    `${heights.length} blocks`;

  return result;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  try {
    const heights = parseHeights(input.value);
    renderResults(heights);
  } catch (error) {
    errorMessage.textContent =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please check your input.";
  }
});

exampleBtn.addEventListener("click", () => {
  input.value = exampleHeights.join(",");
  errorMessage.textContent = "";
  renderResults(exampleHeights);
});

// Render the assignment example on initial page load.
renderResults(exampleHeights);
