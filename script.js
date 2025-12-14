// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    PRIMARY_POINT: '#2196F3',
    PRIMARY_POINT_STROKE: '#1976D2',
    TRIANGLE_SIDE: '#333',
    PERPENDICULAR_PRIMARY: '#E91E63',    // AD, BE
    PERPENDICULAR_SECONDARY: '#9C27B0',  // DP, DQ, DS
    COLLINEARITY_LINE: '#FF9800',        // Line showing P, Q, S collinear
    EXTENSION_LINE: 'rgba(150, 150, 150, 0.5)'
};

const SIZES = {
    MAIN_POINT_RADIUS: 8,
    DERIVED_POINT_RADIUS: 6,
    TRIANGLE_LINE_WIDTH: 2,
    PERPENDICULAR_LINE_WIDTH: 1.5,
    COLLINEARITY_LINE_WIDTH: 2,
    EXTENSION_LINE_WIDTH: 1,
    EXTENSION_LENGTH: 1000
};

// ============================================================================
// CANVAS SETUP AND STATE
// ============================================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size dynamically based on available space
function setCanvasSize() {
    // Calculate optimal canvas size
    const maxWidth = Math.min(window.innerWidth - 40, 1400);
    const maxHeight = Math.min(window.innerHeight - 200, 1000);
    
    // Use 4:3 aspect ratio
    let width = maxWidth;
    let height = width * 0.75;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height / 0.75;
    }
    
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);
    
    return { width: canvas.width, height: canvas.height };
}

const canvasSize = setCanvasSize();

// Configure canvas context for better rendering
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Initialize points A, B, and C proportionally to canvas size
const initialPositions = {
    A: { x: canvasSize.width * 0.25, y: canvasSize.height * 0.25 },
    B: { x: canvasSize.width * 0.75, y: canvasSize.height * 0.25 },
    C: { x: canvasSize.width * 0.5, y: canvasSize.height * 0.75 }
};

const points = {
    A: { x: initialPositions.A.x, y: initialPositions.A.y, radius: SIZES.MAIN_POINT_RADIUS },
    B: { x: initialPositions.B.x, y: initialPositions.B.y, radius: SIZES.MAIN_POINT_RADIUS },
    C: { x: initialPositions.C.x, y: initialPositions.C.y, radius: SIZES.MAIN_POINT_RADIUS }
};

let draggedPoint = null;
let isDragging = false;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Calculate Euclidean distance between two points
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Reset all points to their initial positions
function resetPoints() {
    points.A.x = initialPositions.A.x;
    points.A.y = initialPositions.A.y;
    points.B.x = initialPositions.B.x;
    points.B.y = initialPositions.B.y;
    points.C.x = initialPositions.C.x;
    points.C.y = initialPositions.C.y;
    draw();
}

// ============================================================================
// GEOMETRY FUNCTIONS
// ============================================================================

// Calculate the foot of perpendicular from point P to line defined by L1 and L2
function footOfPerpendicular(P, L1, L2) {
    // Direction vector of the line
    const dx = L2.x - L1.x;
    const dy = L2.y - L1.y;

    // Vector from L1 to P
    const vx = P.x - L1.x;
    const vy = P.y - L1.y;

    // Project v onto d
    const t = (vx * dx + vy * dy) / (dx * dx + dy * dy);

    // Calculate the foot of perpendicular
    return {
        x: L1.x + t * dx,
        y: L1.y + t * dy,
        radius: SIZES.DERIVED_POINT_RADIUS
    };
}

// ============================================================================
// DRAWING FUNCTIONS
// ============================================================================

// Draw a point with label
function drawPoint(point, label, x, y) {
    // Draw the point circle
    ctx.beginPath();
    ctx.arc(x, y, point.radius, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS.PRIMARY_POINT;
    ctx.fill();
    ctx.strokeStyle = COLORS.PRIMARY_POINT_STROKE;
    ctx.lineWidth = SIZES.TRIANGLE_LINE_WIDTH;
    ctx.stroke();

    // Draw the label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - point.radius - 12);
}

// Draw a line segment
function drawLine(x1, y1, x2, y2, style = COLORS.TRIANGLE_SIDE, lineWidth = SIZES.TRIANGLE_LINE_WIDTH) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = style;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

// Draw extended line through two points with faded extensions
function drawExtendedLine(x1, y1, x2, y2) {
    // Calculate direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return;

    // Normalize direction
    const ux = dx / length;
    const uy = dy / length;

    // Calculate extended endpoints
    const extX1 = x1 - ux * SIZES.EXTENSION_LENGTH;
    const extY1 = y1 - uy * SIZES.EXTENSION_LENGTH;
    const extX2 = x2 + ux * SIZES.EXTENSION_LENGTH;
    const extY2 = y2 + uy * SIZES.EXTENSION_LENGTH;

    // Draw faded extension
    ctx.beginPath();
    ctx.moveTo(extX1, extY1);
    ctx.lineTo(extX2, extY2);
    ctx.strokeStyle = COLORS.EXTENSION_LINE;
    ctx.lineWidth = SIZES.EXTENSION_LINE_WIDTH;
    ctx.stroke();
}

// Draw the entire scene
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw faded line extensions first (so they appear behind everything)
    drawExtendedLine(points.A.x, points.A.y, points.B.x, points.B.y);
    drawExtendedLine(points.B.x, points.B.y, points.C.x, points.C.y);
    drawExtendedLine(points.C.x, points.C.y, points.A.x, points.A.y);

    // Draw the triangle sides
    drawLine(points.A.x, points.A.y, points.B.x, points.B.y);
    drawLine(points.B.x, points.B.y, points.C.x, points.C.y);
    drawLine(points.C.x, points.C.y, points.A.x, points.A.y);

    // Calculate point D (foot of perpendicular from A to BC)
    const D = footOfPerpendicular(points.A, points.B, points.C);

    // Calculate point E (foot of perpendicular from B to AC)
    const E = footOfPerpendicular(points.B, points.A, points.C);

    // Draw faded extension for line BE
    drawExtendedLine(points.B.x, points.B.y, E.x, E.y);

    // Calculate point P (foot of perpendicular from D to AB)
    const P = footOfPerpendicular(D, points.A, points.B);

    // Calculate point Q (foot of perpendicular from D to BE)
    const Q = footOfPerpendicular(D, points.B, E);

    // Calculate point S (foot of perpendicular from D to AC)
    const S = footOfPerpendicular(D, points.A, points.C);

    // Draw perpendicular from A to D
    drawLine(points.A.x, points.A.y, D.x, D.y, COLORS.PERPENDICULAR_PRIMARY, SIZES.PERPENDICULAR_LINE_WIDTH);

    // Draw perpendicular from B to E
    drawLine(points.B.x, points.B.y, E.x, E.y, COLORS.PERPENDICULAR_PRIMARY, SIZES.PERPENDICULAR_LINE_WIDTH);

    // Draw perpendicular from D to P
    drawLine(D.x, D.y, P.x, P.y, COLORS.PERPENDICULAR_SECONDARY, SIZES.PERPENDICULAR_LINE_WIDTH);

    // Draw perpendicular from D to Q
    drawLine(D.x, D.y, Q.x, Q.y, COLORS.PERPENDICULAR_SECONDARY, SIZES.PERPENDICULAR_LINE_WIDTH);

    // Draw perpendicular from D to S
    drawLine(D.x, D.y, S.x, S.y, COLORS.PERPENDICULAR_SECONDARY, SIZES.PERPENDICULAR_LINE_WIDTH);

    // Determine which two of P, Q, S are most extreme (furthest apart)
    const distPQ = distance(P, Q);
    const distPS = distance(P, S);
    const distQS = distance(Q, S);

    // Draw line between the two most extreme points to show collinearity
    if (distPQ >= distPS && distPQ >= distQS) {
        drawLine(P.x, P.y, Q.x, Q.y, COLORS.COLLINEARITY_LINE, SIZES.COLLINEARITY_LINE_WIDTH);
    } else if (distPS >= distPQ && distPS >= distQS) {
        drawLine(P.x, P.y, S.x, S.y, COLORS.COLLINEARITY_LINE, SIZES.COLLINEARITY_LINE_WIDTH);
    } else {
        drawLine(Q.x, Q.y, S.x, S.y, COLORS.COLLINEARITY_LINE, SIZES.COLLINEARITY_LINE_WIDTH);
    }

    // Draw the main points
    drawPoint(points.A, 'A', points.A.x, points.A.y);
    drawPoint(points.B, 'B', points.B.x, points.B.y);
    drawPoint(points.C, 'C', points.C.x, points.C.y);

    // Draw point D
    drawPoint(D, 'D', D.x, D.y);

    // Draw point E
    drawPoint(E, 'E', E.x, E.y);

    // Draw point P
    drawPoint(P, 'P', P.x, P.y);

    // Draw point Q
    drawPoint(Q, 'Q', Q.x, Q.y);

    // Draw point S
    drawPoint(S, 'S', S.x, S.y);
}

// ============================================================================
// MOUSE INTERACTION HELPERS
// ============================================================================

// Check if mouse is over a point
function getPointAtPosition(mouseX, mouseY) {
    for (let label in points) {
        const point = points[label];
        const dist = distance({ x: mouseX, y: mouseY }, point);

        if (dist <= point.radius + 5) {
            return label;
        }
    }
    return null;
}

// Get mouse position relative to canvas
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

// Mouse down event
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(e);
    const pointLabel = getPointAtPosition(mousePos.x, mousePos.y);

    if (pointLabel) {
        draggedPoint = pointLabel;
        isDragging = true;
        canvas.classList.add('grabbing');
    }
});

// Mouse move event on canvas for hover effects
canvas.addEventListener('mousemove', (e) => {
    const mousePos = getMousePos(e);

    if (!isDragging) {
        // Change cursor if hovering over a point
        const pointLabel = getPointAtPosition(mousePos.x, mousePos.y);
        canvas.style.cursor = pointLabel ? 'grab' : 'default';
    }
});

// Mouse move event on document to track dragging even outside canvas
document.addEventListener('mousemove', (e) => {
    if (isDragging && draggedPoint) {
        const mousePos = getMousePos(e);

        // Update the position of the dragged point with boundary constraints
        const point = points[draggedPoint];
        points[draggedPoint].x = clamp(mousePos.x, point.radius, canvas.width - point.radius);
        points[draggedPoint].y = clamp(mousePos.y, point.radius, canvas.height - point.radius);

        // Redraw the scene
        draw();
    }
});

// Mouse up event on document to release drag even outside canvas
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        draggedPoint = null;
        canvas.classList.remove('grabbing');
        canvas.style.cursor = 'default';
    }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Reset button handler
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetPoints);

// Initial draw
draw();
