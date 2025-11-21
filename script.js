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

  // Draw shapes
  shapes.forEach(shape => {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";

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

// Handle canvas hover to apply cursor
if (previewCanvas) {
  previewCanvas.addEventListener("mousemove", (e) => {
    const rect = previewCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find which shape the mouse is over
    let cursorToApply = "default";
    for (const shape of shapes) {
      if (isPointInShape(x, y, shape)) {
        cursorToApply = getCursorForShape(shape);
        break;
      }
    }

    previewCanvas.style.cursor = cursorToApply;
  });
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
      "type": "rectangle",
      "x": 50,
      "y": 50,
      "width": 100,
      "height": 80,
      "cursor": "pointer"
    },
    {
      "type": "circle",
      "x": 250,
      "y": 100,
      "radius": 50,
      "cursor": "crosshair"
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
