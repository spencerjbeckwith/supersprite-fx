/** Subdivides a unit quad and returns all its vertices */
function subdivide(divisorX: number, divisorY: number): number[] {
    const positions: number[] = [], stepX = 1/divisorX, stepY = 1/divisorY;
    for (let x = 0; x < 1; x += stepX) {
        for (let y = 0; y < 1; y += stepY) {
            const x2 = x + stepX, y2 = y + stepY;
            // Push a unit quad for this section
            positions.push(
                x, y,
                x, y2,
                x2, y2,
                x2, y2,
                x2, y,
                x, y
            );
        }
    }

    return positions;
}

const subdivisions = {
    unit: subdivide(1, 1),
    four: subdivide(4, 4),
    eight: subdivide(8, 8),
    sixteen: subdivide(16, 16),
    screen: subdivide(50,30),
}

export {
    subdivide,
    subdivisions
}