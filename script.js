const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize points A, B, and C
const points = {
    A: { x: 200, y: 150, radius: 8 },
    B: { x: 600, y: 150, radius: 8 },
    C: { x: 400, y: 450, radius: 8 }
};

let draggedPoint = null;
let isDragging = false;

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
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw the entire scene
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the triangle sides
    drawLine(points.A.x, points.A.y, points.B.x, points.B.y);
    drawLine(points.B.x, points.B.y, points.C.x, points.C.y);
    drawLine(points.C.x, points.C.y, points.A.x, points.A.y);

    // Draw the points
    drawPoint(points.A, 'A', points.A.x, points.A.y);
    drawPoint(points.B, 'B', points.B.x, points.B.y);
    drawPoint(points.C, 'C', points.C.x, points.C.y);
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

// Mouse move event
canvas.addEventListener('mousemove', (e) => {
    const mousePos = getMousePos(e);

    if (isDragging && draggedPoint) {
        // Update the position of the dragged point
        points[draggedPoint].x = mousePos.x;
        points[draggedPoint].y = mousePos.y;

        // Redraw the scene
        draw();
    } else {
        // Change cursor if hovering over a point
        const pointLabel = getPointAtPosition(mousePos.x, mousePos.y);
        canvas.style.cursor = pointLabel ? 'grab' : 'default';
    }
});

// Mouse up event
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPoint = null;
    canvas.classList.remove('grabbing');
    canvas.style.cursor = 'default';
});

// Mouse leave event
canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    draggedPoint = null;
    canvas.classList.remove('grabbing');
    canvas.style.cursor = 'default';
});

// Initial draw
draw();
