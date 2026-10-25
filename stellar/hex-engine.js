/**
 * HexEngine: Pure Mathematical Axial Hex Grid Library (Pointy-Topped)
 * Independent, self-contained, and thoroughly tested for zero bottlenecks.
 */
class HexEngine {
  constructor(hexSize = 42) {
    this.hexSize = hexSize;
    // Axial neighbor directions (q, r)
    this.directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 }
    ];
  }

  // Convert Axial (q, r) coordinates to Pixel (x, y) coordinates
  axialToPixel(q, r) {
    const x = this.hexSize * Math.sqrt(3) * (q + r / 2);
    const y = this.hexSize * (3 / 2) * r;
    return { x, y };
  }

  // Convert Pixel (x, y) coordinates to fractional Axial (q, r)
  pixelToAxial(px, py) {
    const q = ((Math.sqrt(3) / 3) * px - (1 / 3) * py) / this.hexSize;
    const r = ((2 / 3) * py) / this.hexSize;
    return this.axialRound(q, r);
  }

  // Round fractional axial coordinates to nearest integer hex (cube rounding)
  axialRound(fracQ, fracR) {
    const fracS = -fracQ - fracR;
    let q = Math.round(fracQ);
    let r = Math.round(fracR);
    let s = Math.round(fracS);

    const qDiff = Math.abs(q - fracQ);
    const rDiff = Math.abs(r - fracR);
    const sDiff = Math.abs(s - fracS);

    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    }
    return { q, r };
  }

  // Distance between two axial hexes
  distance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }

  // Get all neighboring hexes
  getNeighbors(q, r) {
    return this.directions.map(d => ({ q: q + d.q, r: r + d.r }));
  }

  // Generate a spiral map of given radius centered at (0, 0)
  generateMapGrid(radius = 4) {
    const hexes = [];
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        hexes.push({ q, r, key: `${q},${r}` });
      }
    }
    return hexes;
  }

  // Draw a single pointy-topped hexagon path on HTML5 Canvas
  drawHexPath(ctx, centerX, centerY, size = this.hexSize) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i - 30;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = centerX + size * Math.cos(angleRad);
      const y = centerY + size * Math.sin(angleRad);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }
}

if (typeof module !== 'undefined') {
  module.exports = HexEngine;
}
