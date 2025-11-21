let div = document.getElementById("content");

let cursorTypes = [
  { cursor: "alias" },
  { cursor: "all-scroll" },
  { cursor: "auto" },
  { cursor: "cell" },
  { cursor: "col-resize" },
  { cursor: "context-menu" },
  { cursor: "copy" },
  { cursor: "crosshair" },
  { cursor: "default" },
  { cursor: "e-resize" },
  { cursor: "ew-resize" },
  { cursor: "-webkit-grab", cursor: "grab" },
  { cursor: "-webkit-grabbing", cursor: "grabbing" },
  { cursor: "help" },
  { cursor: "move" },
  { cursor: "n-resize" },
  { cursor: "ne-resize" },
  { cursor: "nesw-resize" },
  { cursor: "ns-resize" },
  { cursor: "nw-resize" },
  { cursor: "nwse-resize" },
  { cursor: "no-drop" },
  { cursor: "none" },
  { cursor: "not-allowed" },
  { cursor: "pointer" },
  { cursor: "progress" },
  { cursor: "row-resize" },
  { cursor: "s-resize" },
  { cursor: "se-resize" },
  { cursor: "sw-resize" },
  { cursor: "text" },
  { cursor: "vertical-text" },
  { cursor: "w-resize" },
  { cursor: "wait" },
  { cursor: "zoom-in" },
  { cursor: "zoom-out" },
];

cursorTypes.forEach((item) => {
  const cursorTestDiv = document.createElement("div");
  cursorTestDiv.innerText = item.cursor;
  cursorTestDiv.style.cursor = item.cursor;
  cursorTestDiv.id = "cursorDiv";

  div.appendChild(cursorTestDiv);
});


function togglemode() {

  const themeStyle = document.getElementById("theme-style");
  const currentTheme = themeStyle.getAttribute("href");

  if (currentTheme === "light.css") {
    themeStyle.setAttribute("href", "dark.css");
  } else {
    themeStyle.setAttribute("href", "light.css");
  }
}

// Custom cursor functionality
const customCursorTestArea = document.getElementById("customCursorTest");
const cursorUploadInput = document.getElementById("cursorUpload");
const hotspotXInput = document.getElementById("hotspotX");
const hotspotYInput = document.getElementById("hotspotY");

// Store current cursor URL for re-applying with different hotspots
let currentCursorURL = null;

// Cursor storage with generated names
const cursorLibrary = new Map();
let cursorCounter = 0;
let lastUploadedCursor = null;

// Generate cursor name from filename
function generateCursorName(filename) {
  const baseName = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_"); // Sanitize
  cursorCounter++;
  return `${safeName}_${cursorCounter}`;
}

// Handle file upload for custom cursor
cursorUploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      const cursorName = generateCursorName(file.name);
      cursorLibrary.set(cursorName, {
        url: dataURL,
        filename: file.name,
        hotspot: { x: 0, y: 0 }
      });
      lastUploadedCursor = cursorName;
      currentCursorURL = dataURL;
      applyCustomCursor(dataURL);
      updateCursorList();
      saveCursorsToStorage();
    };
    reader.readAsDataURL(file);
  }
});

// Apply custom cursor to test area
function applyCustomCursor(url) {
  const hotspotX = hotspotXInput.value || 0;
  const hotspotY = hotspotYInput.value || 0;
  customCursorTestArea.style.cursor = `url('${url}') ${hotspotX} ${hotspotY}, auto`;
}

// Apply current cursor with updated hotspot values
function applyCurrentCursor() {
  if (currentCursorURL) {
    applyCustomCursor(currentCursorURL);
  }
}

// Load pre-made test cursors
function loadTestCursor(testName) {
  const cursorPath = `assets/images/${testName}.svg`;
  currentCursorURL = cursorPath;
  applyCustomCursor(cursorPath);
}

// Reset custom cursor to default
function resetCustomCursor() {
  customCursorTestArea.style.cursor = "default";
  cursorUploadInput.value = ""; // Clear file input
  currentCursorURL = null;
  hotspotXInput.value = 0;
  hotspotYInput.value = 0;
}

// Update cursor list display
function updateCursorList() {
  const listElement = document.getElementById("cursorList");
  if (listElement) {
    listElement.innerHTML = "";
    cursorLibrary.forEach((cursor, name) => {
      const item = document.createElement("div");
      item.className = "cursor-list-item";
      item.textContent = `${name} (${cursor.filename})`;
      listElement.appendChild(item);
    });
  }
}

// Save cursors to localStorage
function saveCursorsToStorage() {
  try {
    const cursorsArray = Array.from(cursorLibrary.entries());
    localStorage.setItem("cursorLibrary", JSON.stringify(cursorsArray));
    localStorage.setItem("cursorCounter", cursorCounter.toString());
  } catch (e) {
    console.error("Failed to save cursors to localStorage:", e);
  }
}

// Load cursors from localStorage
function loadCursorsFromStorage() {
  try {
    const stored = localStorage.getItem("cursorLibrary");
    const storedCounter = localStorage.getItem("cursorCounter");

    if (stored) {
      const cursorsArray = JSON.parse(stored);
      cursorLibrary.clear();
      cursorsArray.forEach(([name, cursor]) => {
        cursorLibrary.set(name, cursor);
      });
      updateCursorList();
    }

    if (storedCounter) {
      cursorCounter = parseInt(storedCounter, 10);
    }
  } catch (e) {
    console.error("Failed to load cursors from localStorage:", e);
  }
}

// Preview area functionality
const previewCanvas = document.getElementById("previewCanvas");
const previewImageUpload = document.getElementById("previewImageUpload");
const shapeJsonEditor = document.getElementById("shapeJsonEditor");
let previewImage = null;
let shapes = [];

// Load preview image
if (previewImageUpload) {
  previewImageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          previewImage = img;
          renderPreview();
          savePreviewImageToStorage(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Save preview image to localStorage
function savePreviewImageToStorage(dataURL) {
  try {
    localStorage.setItem("previewImage", dataURL);
  } catch (e) {
    console.error("Failed to save preview image to localStorage:", e);
  }
}

// Load preview image from localStorage
function loadPreviewImageFromStorage() {
  try {
    const stored = localStorage.getItem("previewImage");
    if (stored) {
      const img = new Image();
      img.onload = () => {
        previewImage = img;
        renderPreview();
      };
      img.src = stored;
      return true;
    }
  } catch (e) {
    console.error("Failed to load preview image from localStorage:", e);
  }
  return false;
}

// Parse and render shapes from JSON
function updateShapesFromJSON() {
  try {
    const jsonText = shapeJsonEditor.value;
    shapes = JSON.parse(jsonText);
    renderPreview();
    saveShapesToStorage();
  } catch (e) {
    console.error("Invalid JSON:", e);
  }
}

// Save shapes JSON to localStorage
function saveShapesToStorage() {
  try {
    if (shapeJsonEditor) {
      localStorage.setItem("shapesJSON", shapeJsonEditor.value);
    }
  } catch (e) {
    console.error("Failed to save shapes to localStorage:", e);
  }
}

// Load shapes JSON from localStorage
function loadShapesFromStorage() {
  try {
    const stored = localStorage.getItem("shapesJSON");
    if (stored && shapeJsonEditor) {
      shapeJsonEditor.value = stored;
      shapes = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load shapes from localStorage:", e);
  }
}

// Render preview canvas
function renderPreview() {
  if (!previewCanvas || !previewImage) return;

  const ctx = previewCanvas.getContext("2d");
  previewCanvas.width = previewImage.width;
  previewCanvas.height = previewImage.height;

  // Draw background image
  ctx.drawImage(previewImage, 0, 0);

  // Determine shape opacity based on mode
  const currentDrawMode = getDrawMode();
  const isInHoverMode = currentDrawMode === "none" && !jsonEditorHasFocus;
  const shapeOpacity = isInHoverMode ? 0.02 : 0.15;
  const strokeOpacity = isInHoverMode ? 0.3 : 1.0;

  // Draw shapes
  shapes.forEach((shape, index) => {
    // Highlight active shape in blue
    const isActive = index === activeShapeIndex;
    const strokeStyle = isActive ? "rgba(0, 120, 255, 1.0)" : `rgba(255, 0, 0, ${strokeOpacity})`;
    const fillStyle = isActive ? "rgba(0, 120, 255, 0.25)" : `rgba(255, 0, 0, ${shapeOpacity})`;

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.fillStyle = fillStyle;

    if (shape.type === "rectangle") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
    }
  });
}

// Drawing state
let drawMode = "none";
let isDrawing = false;
let drawStart = { x: 0, y: 0 };
let currentDrawnShape = null;
let jsonEditorHasFocus = false;
let activeShapeIndex = -1;

// Get current draw mode
function getDrawMode() {
  const checked = document.querySelector('input[name="drawMode"]:checked');
  return checked ? checked.value : "none";
}

// Track JSON editor focus and cursor position
if (shapeJsonEditor) {
  shapeJsonEditor.addEventListener("focus", () => {
    jsonEditorHasFocus = true;
    renderPreview();
  });

  shapeJsonEditor.addEventListener("blur", () => {
    jsonEditorHasFocus = false;
    activeShapeIndex = -1;
    renderPreview();
  });

  // Track cursor position to highlight corresponding shape
  shapeJsonEditor.addEventListener("click", updateActiveShapeFromCursor);
  shapeJsonEditor.addEventListener("keyup", updateActiveShapeFromCursor);
}

// Determine which shape the cursor is on in the JSON editor
function updateActiveShapeFromCursor() {
  if (!shapeJsonEditor) return;

  try {
    const cursorPos = shapeJsonEditor.selectionStart;
    const jsonText = shapeJsonEditor.value;
    const shapes = JSON.parse(jsonText);

    // Find which shape object contains the cursor position
    let currentPos = 0;
    let foundIndex = -1;

    // Parse through the JSON structure to find cursor position
    const arrayMatch = jsonText.match(/^\s*\[/);
    if (!arrayMatch) return;

    currentPos = arrayMatch[0].length;

    for (let i = 0; i < shapes.length; i++) {
      const shapeText = JSON.stringify(shapes[i], null, 2);
      const shapeStart = currentPos;
      const shapeEnd = currentPos + shapeText.length;

      if (cursorPos >= shapeStart && cursorPos <= shapeEnd) {
        foundIndex = i;
        break;
      }

      currentPos = shapeEnd + 1; // +1 for comma
      // Skip whitespace
      while (currentPos < jsonText.length && /[\s,]/.test(jsonText[currentPos])) {
        currentPos++;
      }
    }

    if (activeShapeIndex !== foundIndex) {
      activeShapeIndex = foundIndex;
      renderPreview();
    }
  } catch (e) {
    // Invalid JSON, ignore
  }
}

// Get canvas coordinates accounting for scale
function getCanvasCoordinates(e) {
  const rect = previewCanvas.getBoundingClientRect();
  const scaleX = previewCanvas.width / rect.width;
  const scaleY = previewCanvas.height / rect.height;

  const x = Math.round((e.clientX - rect.left) * scaleX);
  const y = Math.round((e.clientY - rect.top) * scaleY);

  return { x, y };
}

// Handle canvas hover to apply cursor
if (previewCanvas) {
  previewCanvas.addEventListener("mousemove", (e) => {
    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    drawMode = getDrawMode();

    if (isDrawing && drawMode !== "none") {
      // Draw temporary shape
      currentDrawnShape = createShapeFromDrag(drawStart.x, drawStart.y, x, y, drawMode);
      renderPreview();
      drawTemporaryShape(currentDrawnShape);
    } else {
      // Find which shape the mouse is over
      let cursorToApply = "default";
      for (const shape of shapes) {
        if (isPointInShape(x, y, shape)) {
          cursorToApply = getCursorForShape(shape);
          break;
        }
      }
      previewCanvas.style.cursor = cursorToApply;
    }
  });

  // Click on canvas to select shape in JSON editor
  previewCanvas.addEventListener("click", (e) => {
    drawMode = getDrawMode();
    if (drawMode !== "none" || isDrawing) return;

    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    // Find which shape was clicked
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (isPointInShape(x, y, shapes[i])) {
        highlightShapeInEditor(i);
        break;
      }
    }
  });

  previewCanvas.addEventListener("mousedown", (e) => {
    drawMode = getDrawMode();
    if (drawMode === "none") return;

    const coords = getCanvasCoordinates(e);
    drawStart.x = coords.x;
    drawStart.y = coords.y;
    isDrawing = true;
  });

  previewCanvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;

    if (currentDrawnShape) {
      displayGeneratedJson(currentDrawnShape);
    }

    isDrawing = false;
    currentDrawnShape = null;
    renderPreview();
  });

  previewCanvas.addEventListener("mouseleave", () => {
    if (isDrawing) {
      isDrawing = false;
      currentDrawnShape = null;
      renderPreview();
    }
  });
}

// Create shape object from drag coordinates
function createShapeFromDrag(x1, y1, x2, y2, type) {
  // Use most recent uploaded cursor, or fallback to "pointer"
  const shape = { cursor: lastUploadedCursor || "pointer" };

  if (type === "rectangle") {
    shape.type = "rectangle";
    shape.x = Math.min(x1, x2);
    shape.y = Math.min(y1, y2);
    shape.width = Math.abs(x2 - x1);
    shape.height = Math.abs(y2 - y1);
  } else if (type === "circle") {
    shape.type = "circle";
    shape.x = x1;
    shape.y = y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    shape.radius = Math.round(Math.sqrt(dx * dx + dy * dy));
  } else if (type === "line") {
    shape.type = "line";
    shape.x1 = x1;
    shape.y1 = y1;
    shape.x2 = x2;
    shape.y2 = y2;
  }

  return shape;
}

// Draw temporary shape on canvas
function drawTemporaryShape(shape) {
  if (!shape || !previewCanvas) return;

  const ctx = previewCanvas.getContext("2d");
  ctx.strokeStyle = "#0078ff";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(0, 120, 255, 0.1)";
  ctx.setLineDash([5, 5]);

  if (shape.type === "rectangle") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  } else if (shape.type === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}

// Display generated JSON
function displayGeneratedJson(shape) {
  const output = document.getElementById("generatedJson");
  if (output) {
    output.value = JSON.stringify(shape, null, 2);
  }
}

// Add generated JSON to editor and apply
function addGeneratedToEditor() {
  const output = document.getElementById("generatedJson");
  if (!output || !output.value || !shapeJsonEditor) return;

  try {
    const newShape = JSON.parse(output.value);
    const currentShapes = JSON.parse(shapeJsonEditor.value);
    currentShapes.push(newShape);
    shapeJsonEditor.value = JSON.stringify(currentShapes, null, 2);
    // Automatically apply the shapes
    updateShapesFromJSON();
  } catch (e) {
    alert("Error adding shape: " + e.message);
  }
}

// Highlight a shape in the JSON editor
function highlightShapeInEditor(shapeIndex) {
  if (!shapeJsonEditor || shapeIndex < 0 || shapeIndex >= shapes.length) return;

  try {
    const jsonText = shapeJsonEditor.value;
    const parsedShapes = JSON.parse(jsonText);

    // Find the position of this shape in the text
    let currentPos = 0;
    const arrayMatch = jsonText.match(/^\s*\[/);
    if (!arrayMatch) return;

    currentPos = arrayMatch[0].length;

    for (let i = 0; i < parsedShapes.length; i++) {
      const shapeText = JSON.stringify(parsedShapes[i], null, 2);

      if (i === shapeIndex) {
        // Select this shape's text
        shapeJsonEditor.focus();
        shapeJsonEditor.setSelectionRange(currentPos, currentPos + shapeText.length);
        activeShapeIndex = shapeIndex;
        renderPreview();
        return;
      }

      currentPos += shapeText.length + 1; // +1 for comma
      // Skip whitespace
      while (currentPos < jsonText.length && /[\s,]/.test(jsonText[currentPos])) {
        currentPos++;
      }
    }
  } catch (e) {
    console.error("Error highlighting shape:", e);
  }
}

// Check if point is in shape
function isPointInShape(x, y, shape) {
  if (shape.type === "rectangle") {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  } else if (shape.type === "circle") {
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= shape.radius * shape.radius;
  } else if (shape.type === "line") {
    // Line hit detection with tolerance
    const tolerance = 5;
    const dist = pointToLineDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
    return dist <= tolerance;
  }
  return false;
}

// Distance from point to line segment
function pointToLineDistance(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get cursor for shape
function getCursorForShape(shape) {
  if (!shape.cursor) return "default";

  // Check if it's a stored cursor
  if (cursorLibrary.has(shape.cursor)) {
    const cursor = cursorLibrary.get(shape.cursor);
    return `url('${cursor.url}') ${cursor.hotspot.x} ${cursor.hotspot.y}, auto`;
  }

  // Otherwise use standard cursor name
  return shape.cursor;
}

// Initialize JSON editor with default value
if (shapeJsonEditor) {
  shapeJsonEditor.value = JSON.stringify([
    {
      "cursor": "pointer",
      "type": "rectangle",
      "x": 327,
      "y": 253,
      "width": 99,
      "height": 112
    },
    {
      "cursor": "new_bendpoint_km2_1",
      "type": "line",
      "x1": 388,
      "y1": 89,
      "x2": 380,
      "y2": 241
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 322,
      "y": 247,
      "radius": 6
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 546,
      "y": 84,
      "radius": 6
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 675,
      "y": 51,
      "radius": 5
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 819,
      "y": 147,
      "radius": 31
    },
    {
      "cursor": "pointer",
      "type": "line",
      "x1": 550,
      "y1": 71,
      "x2": 613,
      "y2": 69
    },
    {
      "cursor": "pointer",
      "type": "line",
      "x1": 618,
      "y1": 71,
      "x2": 656,
      "y2": 81
    },
    {
      "cursor": "pointer",
      "type": "line",
      "x1": 660,
      "y1": 83,
      "x2": 680,
      "y2": 93
    },
    {
      "cursor": "pointer",
      "type": "line",
      "x1": 690,
      "y1": 93,
      "x2": 760,
      "y2": 81
    },
    {
      "cursor": "pointer",
      "type": "rectangle",
      "x": 189,
      "y": 102,
      "width": 5,
      "height": 9
    },
    {
      "cursor": "text",
      "type": "split",
      "x": 167,
      "y": 119,
      "width": 12,
      "height": 7
    },
    {
      "cursor": "pointer",
      "type": "rectangle",
      "x": 189,
      "y": 134,
      "width": 5,
      "height": 13
    },
    {
      "cursor": "pointer",
      "type": "rectangle",
      "x": 203,
      "y": 119,
      "width": 14,
      "height": 6
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 31,
      "y": 104,
      "radius": 11
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 29,
      "y": 140,
      "radius": 11
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 389,
      "y": 69,
      "radius": 13
    },
    {
      "cursor": "text",
      "type": "rectangle",
      "x": 447,
      "y": 129,
      "width": 286,
      "height": 42
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 281,
      "y": 213,
      "radius": 6
    },
    {
      "cursor": "pointer",
      "type": "circle",
      "x": 352,
      "y": 214,
      "radius": 4
    }
  ], null, 2);
}

// Load default background image
function loadDefaultImage() {
  const img = new Image();
  img.onload = () => {
    previewImage = img;
    renderPreview();
  };
  img.onerror = () => {
    console.error("Failed to load default image: fritzing_testview.png");
  };
  img.src = "fritzing_testview.png";
}

// Initialize on page load
function initializeApp() {
  // Load saved cursors
  loadCursorsFromStorage();

  // Load saved shapes JSON
  const hasStoredShapes = localStorage.getItem("shapesJSON");
  if (hasStoredShapes) {
    loadShapesFromStorage();
  }

  // Load preview image (stored or default)
  if (previewCanvas) {
    const hasStoredImage = loadPreviewImageFromStorage();
    if (!hasStoredImage) {
      // Load default image if no stored image
      loadDefaultImage();
    }
  }
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
