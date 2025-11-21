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
  cursorTestDiv.className = "cursorDiv";

  div.appendChild(cursorTestDiv);
});

// Function to update cursor test area with uploaded and built-in cursors
function updateCursorTestArea() {
  const div = document.getElementById("content");
  if (!div) return;

  // Remove old custom cursor divs and separator
  const oldCustomDivs = div.querySelectorAll('.custom-cursor-div');
  oldCustomDivs.forEach(d => d.remove());
  const oldSeparator = div.querySelector('.cursor-separator');
  if (oldSeparator) oldSeparator.remove();

  // Add separator
  const separator = document.createElement("div");
  separator.className = "cursor-separator custom-cursor-div";
  separator.innerHTML = "<h5>Custom Cursors</h5>";
  div.appendChild(separator);

  // Add built-in cursors from cursors directory
  Object.keys(cursorFileMap).forEach(cursorName => {
    const cursorTestDiv = document.createElement("div");
    cursorTestDiv.innerText = cursorName;
    cursorTestDiv.style.cursor = `url('${cursorFileMap[cursorName]}') 0 0, auto`;
    cursorTestDiv.className = "cursorDiv custom-cursor-div";
    div.appendChild(cursorTestDiv);
  });

  // Add uploaded cursors
  cursorLibrary.forEach((cursor, name) => {
    const cursorTestDiv = document.createElement("div");
    cursorTestDiv.innerText = name;
    cursorTestDiv.style.cursor = `url('${cursor.url}') ${cursor.hotspot.x} ${cursor.hotspot.y}, auto`;
    cursorTestDiv.className = "cursorDiv custom-cursor-div";
    div.appendChild(cursorTestDiv);
  });
}


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
      const hotspotX = parseInt(hotspotXInput.value) || 0;
      const hotspotY = parseInt(hotspotYInput.value) || 0;
      cursorLibrary.set(cursorName, {
        url: dataURL,
        filename: file.name,
        hotspot: { x: hotspotX, y: hotspotY }
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

    // Update hotspot in cursorLibrary for the last uploaded cursor
    if (lastUploadedCursor && cursorLibrary.has(lastUploadedCursor)) {
      const cursor = cursorLibrary.get(lastUploadedCursor);
      const hotspotX = parseInt(hotspotXInput.value) || 0;
      const hotspotY = parseInt(hotspotYInput.value) || 0;
      cursor.hotspot = { x: hotspotX, y: hotspotY };
      cursorLibrary.set(lastUploadedCursor, cursor);
      saveCursorsToStorage();
    }
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
  // Also update the test area
  updateCursorTestArea();
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

    // Draw aura effect for active shape with gradient glow
    if (isActive) {
      const gap = 10;
      const auraWidth = 40;

      if (shape.shape === "rectangle") {
        // Draw multiple layers for gradient effect
        const steps = 10;
        for (let i = steps; i > 0; i--) {
          const progress = i / steps;
          const currentGap = gap + (auraWidth * (1 - progress));
          // Fade out near the shape (at gap distance) and at outer edge
          const distanceFromGap = currentGap - gap;
          const opacity = (0.5 * progress) * Math.sin((distanceFromGap / auraWidth) * Math.PI);

          ctx.strokeStyle = `rgba(0, 120, 255, ${opacity})`;
          ctx.lineWidth = 3;

          const auraX = shape.x - currentGap;
          const auraY = shape.y - currentGap;
          const auraW = shape.width + 2 * currentGap;
          const auraH = shape.height + 2 * currentGap;
          ctx.strokeRect(auraX, auraY, auraW, auraH);
        }
      } else if (shape.shape === "circle") {
        // Use radial gradient for smooth glow - starts transparent, peaks in middle, fades out
        const gradient = ctx.createRadialGradient(
          shape.x, shape.y, shape.radius + gap,
          shape.x, shape.y, shape.radius + gap + auraWidth
        );
        gradient.addColorStop(0, "rgba(0, 120, 255, 0)");
        gradient.addColorStop(0.3, "rgba(0, 120, 255, 0.5)");
        gradient.addColorStop(0.7, "rgba(0, 120, 255, 0.3)");
        gradient.addColorStop(1, "rgba(0, 120, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius + gap + auraWidth, 0, 2 * Math.PI);
        ctx.fill();
      } else if (shape.shape === "line") {
        // Calculate line properties
        const dx = shape.x2 - shape.x1;
        const dy = shape.y2 - shape.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Calculate perpendicular offset for the glow rectangle
        const totalGlowWidth = gap + auraWidth;

        // Save context and transform to line coordinate system
        ctx.save();
        ctx.translate(shape.x1, shape.y1);
        ctx.rotate(angle);

        // Create gradient perpendicular to the line
        const gradient = ctx.createLinearGradient(0, -totalGlowWidth, 0, totalGlowWidth);
        gradient.addColorStop(0, "rgba(0, 120, 255, 0)"); // Outer edge - transparent
        gradient.addColorStop(0.2, "rgba(0, 120, 255, 0.4)"); // Fade in
        gradient.addColorStop(0.4, "rgba(0, 120, 255, 0.6)"); // Peak brightness
        gradient.addColorStop(0.5, "rgba(0, 120, 255, 0)"); // Near line - transparent
        gradient.addColorStop(0.6, "rgba(0, 120, 255, 0.6)"); // Peak brightness
        gradient.addColorStop(0.8, "rgba(0, 120, 255, 0.4)"); // Fade out
        gradient.addColorStop(1, "rgba(0, 120, 255, 0)"); // Outer edge - transparent

        // Draw glow rectangle along the line
        ctx.fillStyle = gradient;
        ctx.fillRect(0, -totalGlowWidth, length, totalGlowWidth * 2);

        ctx.restore();
      }
    }

    const strokeStyle = isActive ? "rgba(0, 120, 255, 1.0)" : `rgba(255, 0, 0, ${strokeOpacity})`;
    const fillStyle = isActive ? "rgba(0, 120, 255, 0.25)" : `rgba(255, 0, 0, ${shapeOpacity})`;

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.fillStyle = fillStyle;

    if (shape.shape === "rectangle") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.shape === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    } else if (shape.shape === "line") {
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

// Add event listeners to draw mode buttons to update transparency
const drawModeButtons = document.querySelectorAll('input[name="drawMode"]');
drawModeButtons.forEach(button => {
  button.addEventListener("change", () => {
    renderPreview();
  });
});

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

    // Find object boundaries by tracking braces in the actual text
    let foundIndex = -1;
    let depth = 0;
    let objectCount = -1;
    let objectStart = -1;
    let inString = false;
    let escapeNext = false;
    let inArray = false;

    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i];

      // Handle string escaping
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      // Track string state
      if (char === '"') {
        inString = !inString;
        continue;
      }

      // Only process non-string characters
      if (!inString) {
        if (char === '[') {
          inArray = true;
        } else if (char === '{') {
          if (inArray && depth === 0) {
            // Start of a shape object (directly inside array)
            objectCount++;
            objectStart = i;
          }
          depth++;
        } else if (char === '}') {
          depth--;
          if (inArray && depth === 0) {
            // End of a shape object
            if (cursorPos >= objectStart && cursorPos <= i) {
              foundIndex = objectCount;
              break;
            }
          }
        }
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
function createShapeFromDrag(x1, y1, x2, y2, shapeType) {
  // Use most recent uploaded cursor, or fallback to "pointer"
  const shape = { cursor: lastUploadedCursor || "pointer" };

  if (shapeType === "rectangle") {
    shape.shape = "rectangle";
    shape.x = Math.min(x1, x2);
    shape.y = Math.min(y1, y2);
    shape.width = Math.abs(x2 - x1);
    shape.height = Math.abs(y2 - y1);
  } else if (shapeType === "circle") {
    shape.shape = "circle";
    shape.x = x1;
    shape.y = y1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    shape.radius = Math.round(Math.sqrt(dx * dx + dy * dy));
  } else if (shapeType === "line") {
    shape.shape = "line";
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

  if (shape.shape === "rectangle") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.shape === "circle") {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  } else if (shape.shape === "line") {
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

    // Find object boundaries by tracking braces in the actual text
    let depth = 0;
    let objectCount = -1;
    let objectStart = -1;
    let objectEnd = -1;
    let inString = false;
    let escapeNext = false;
    let inArray = false;

    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i];

      // Handle string escaping
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      // Track string state
      if (char === '"') {
        inString = !inString;
        continue;
      }

      // Only process non-string characters
      if (!inString) {
        if (char === '[') {
          inArray = true;
        } else if (char === '{') {
          if (inArray && depth === 0) {
            // Start of a shape object (directly inside array)
            objectCount++;
            objectStart = i;
          }
          depth++;
        } else if (char === '}') {
          depth--;
          if (inArray && depth === 0) {
            // End of a shape object
            objectEnd = i;
            if (objectCount === shapeIndex) {
              // Select this shape's text
              shapeJsonEditor.focus();
              shapeJsonEditor.setSelectionRange(objectStart, objectEnd + 1);
              activeShapeIndex = shapeIndex;
              renderPreview();
              return;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error highlighting shape:", e);
  }
}

// Check if point is in shape
function isPointInShape(x, y, shape) {
  if (shape.shape === "rectangle") {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  } else if (shape.shape === "circle") {
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= shape.radius * shape.radius;
  } else if (shape.shape === "line") {
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

// Cursor name to file mapping for built-in cursors
const cursorFileMap = {
  "split": "cursors/spot_face_cutter.png",
  "bendleg": "cursors/bendleg.png",
  "bendpoint": "cursors/bendpoint.png",
  "curve": "cursors/curve.png",
  "magic_wand": "cursors/magic_wand.png",
  "make_wire": "cursors/make_wire.png",
  "new_bendpoint": "cursors/new_bendpoint.png",
  "part_move": "cursors/part_move.png",
  "rotate": "cursors/rotate.png",
  "rubberband_move": "cursors/rubberband_move.png",
  "scale": "cursors/scale.png"
};

// Get cursor for shape
function getCursorForShape(shape) {
  if (!shape.cursor) return "default";

  // Check if it's a stored cursor
  if (cursorLibrary.has(shape.cursor)) {
    const cursor = cursorLibrary.get(shape.cursor);
    return `url('${cursor.url}') ${cursor.hotspot.x} ${cursor.hotspot.y}, auto`;
  }

  // Check if it's a mapped cursor file
  if (cursorFileMap[shape.cursor]) {
    return `url('${cursorFileMap[shape.cursor]}') 0 0, auto`;
  }

  // Otherwise use standard cursor name
  return shape.cursor;
}

// Load default JSON from file
async function loadDefaultJSON() {
  try {
    const response = await fetch('assets/fritzing_testview.json');
    const defaultShapes = await response.json();
    if (shapeJsonEditor) {
      shapeJsonEditor.value = JSON.stringify(defaultShapes, null, 2);
    }
  } catch (e) {
    console.error("Failed to load default JSON:", e);
  }
}

// Load default background image
function loadDefaultImage() {
  const img = new Image();
  img.onload = () => {
    previewImage = img;
    renderPreview();
  };
  img.onerror = () => {
    console.error("Failed to load default image: assets/fritzing_testview.png");
  };
  img.src = "assets/fritzing_testview.png";
}

// Initialize on page load
async function initializeApp() {
  // Load saved cursors
  loadCursorsFromStorage();

  // Load saved shapes JSON or default from file
  const hasStoredShapes = localStorage.getItem("shapesJSON");
  if (hasStoredShapes) {
    loadShapesFromStorage();
  } else {
    await loadDefaultJSON();
  }

  // Load preview image (stored or default)
  if (previewCanvas) {
    const hasStoredImage = loadPreviewImageFromStorage();
    if (!hasStoredImage) {
      // Load default image if no stored image
      loadDefaultImage();
    }
  }

  // Initialize cursor test area with built-in cursors
  updateCursorTestArea();
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
