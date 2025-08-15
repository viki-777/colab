const getWidthAndHeight = (
  x: number,
  y: number,
  from: [number, number],
  shift?: boolean
) => {
  let width = x - from[0];
  let height = y - from[1];

  if (shift) {
    if (Math.abs(width) > Math.abs(height)) {
      if ((width > 0 && height < 0) || (width < 0 && height > 0))
        width = -height;
      else width = height;
    } else if ((height > 0 && width < 0) || (height < 0 && width > 0))
      height = -width;
    else height = width;
  } else {
    width = x - from[0];
    height = y - from[1];
  }

  return { width, height };
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean,
  fillEnabled?: boolean
) => {
  ctx.beginPath();

  const { width, height } = getWidthAndHeight(x, y, from, shift);

  const cX = from[0] + width / 2;
  const cY = from[1] + height / 2;
  const radiusX = Math.abs(width / 2);
  const radiusY = Math.abs(height / 2);

  ctx.ellipse(cX, cY, radiusX, radiusY, 0, 0, 2 * Math.PI);

  ctx.stroke();
  if (fillEnabled) ctx.fill();
  ctx.closePath();

  return { cX, cY, radiusX, radiusY };
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean,
  fill?: boolean,
  fillEnabled?: boolean
) => {
  ctx.beginPath();

  const { width, height } = getWidthAndHeight(x, y, from, shift);

  if (fill) ctx.fillRect(from[0], from[1], width, height);
  else ctx.rect(from[0], from[1], width, height);

  ctx.stroke();
  if (fillEnabled && !fill) ctx.fill();
  ctx.closePath();

  return { width, height };
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean
) => {
  if (shift) {
    ctx.beginPath();
    ctx.lineTo(from[0], from[1]);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();

    return;
  }

  ctx.lineTo(x, y);
  ctx.stroke();
};

export const drawLineSegment = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean
) => {
  ctx.beginPath();
  
  if (shift) {
    // Constrain to horizontal, vertical, or 45-degree angles
    const dx = x - from[0];
    const dy = y - from[1];
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal line
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(x, from[1]);
    } else {
      // Vertical line
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(from[0], y);
    }
  } else {
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(x, y);
  }
  
  ctx.stroke();
  ctx.closePath();
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean
) => {
  ctx.beginPath();
  
  // Calculate angle and distance
  let dx = x - from[0];
  let dy = y - from[1];
  
  if (shift) {
    // Constrain to horizontal, vertical, or 45-degree angles
    if (Math.abs(dx) > Math.abs(dy)) {
      dy = 0; // Horizontal
    } else {
      dx = 0; // Vertical
    }
  }
  
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Draw main line
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(from[0] + dx, from[1] + dy);
  
  // Draw arrowhead
  const headlen = Math.min(20, length * 0.3); // Arrow head length
  ctx.lineTo(
    from[0] + dx - headlen * Math.cos(angle - Math.PI / 6),
    from[1] + dy - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(from[0] + dx, from[1] + dy);
  ctx.lineTo(
    from[0] + dx - headlen * Math.cos(angle + Math.PI / 6),
    from[1] + dy - headlen * Math.sin(angle + Math.PI / 6)
  );
  
  ctx.stroke();
  ctx.closePath();
};

export const drawStar = (
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  x: number,
  y: number,
  shift?: boolean,
  fillEnabled?: boolean
) => {
  const { width, height } = getWidthAndHeight(x, y, from, shift);
  
  const centerX = from[0] + width / 2;
  const centerY = from[1] + height / 2;
  const outerRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
  const innerRadius = outerRadius * 0.4;
  const points = 5;
  
  ctx.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const pointX = centerX + Math.cos(angle - Math.PI / 2) * radius;
    const pointY = centerY + Math.sin(angle - Math.PI / 2) * radius;
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  if (fillEnabled) ctx.fill();
};
