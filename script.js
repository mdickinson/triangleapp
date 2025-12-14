const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize points A, B, and C
const initialPositions = {
    A: { x: 200, y: 150 },
    B: { x: 600, y: 150 },
    C: { x: 400, y: 450 }
};

const points = {
    A: { x: 200, y: 150, radius: 8 },
    B: { x: 600, y: 150, radius: 8 },
    C: { x: 400, y: 450, radius: 8 }
};

let draggedPoint = null;
let isDragging = false;

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

// Draw a point
function drawPoint(point, label, x, y) {
    // Draw the point circle
    ctx.beginPath();
    ctx.arc(x, y, point.radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#2196F3';
    ctx.fill();
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - point.radius - 12);
}

// Draw a line segment
function drawLine(x1, y1, x2, y2, style = '#333', lineWidth = 2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = style;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

// Draw extended line through two points with faded extensions
function drawExtendedLine(x1, y1, x2, y2, extensionLength = 1000) {
    // Calculate direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return;

    // Normalize direction
    const ux = dx / length;
    const uy = dy / length;

    // Calculate extended endpoints
    const extX1 = x1 - ux * extensionLength;
    const extY1 = y1 - uy * extensionLength;
    const extX2 = x2 + ux * extensionLength;
    const extY2 = y2 + uy * extensionLength;

    // Draw faded extension
    ctx.beginPath();
    ctx.moveTo(extX1, extY1);
    ctx.lineTo(extX2, extY2);
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Calculate the foot of perpendicular from point P to line segment defined by L1 and L2
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
        radius: 6
    };
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
    drawLine(points.A.x, points.A.y, D.x, D.y, '#E91E63', 1.5);

    // Draw perpendicular from B to E
    drawLine(points.B.x, points.B.y, E.x, E.y, '#E91E63', 1.5);

    // Draw perpendicular from D to P
    drawLine(D.x, D.y, P.x, P.y, '#9C27B0', 1.5);

    // Draw perpendicular from D to Q
    drawLine(D.x, D.y, Q.x, Q.y, '#9C27B0', 1.5);

    // Draw perpendicular from D to S
    drawLine(D.x, D.y, S.x, S.y, '#9C27B0', 1.5);

    // Draw line from P to S
    drawLine(P.x, P.y, S.x, S.y, '#FF9800', 2);

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

// Check if mouse is over a point
function getPointAtPosition(mouseX, mouseY) {
    for (let label in points) {
        const point = points[label];
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= point.radius + 5) {
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

// Reset button handler
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetPoints);

// Initial draw
draw();
