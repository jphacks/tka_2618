type PathCommand = 'M' | 'm' | 'L' | 'l' | 'Z' | 'z';

const TOKEN_PATTERN = /[MLZmlz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const UNSUPPORTED_COMMAND_PATTERN = /[A-DF-Za-df-z]/g;

function isPathCommand(token: string): token is PathCommand {
  return token === 'M' || token === 'm'
    || token === 'L' || token === 'l'
    || token === 'Z' || token === 'z';
}

export type MapShapeBounds = { x: number; y: number; width: number; height: number };

/** 地域の外接矩形を返します。対応していないパス命令を含む場合は null です。 */
export function calculateMapShapeBounds(path: string): MapShapeBounds | null {
  const unsupportedCommands = path.match(UNSUPPORTED_COMMAND_PATTERN) ?? [];
  if (unsupportedCommands.some(command => !isPathCommand(command))) return null;

  const tokens = path.match(TOKEN_PATTERN) ?? [];
  let command: PathCommand | null = null;
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const includePoint = () => {
    minX = Math.min(minX, currentX);
    minY = Math.min(minY, currentY);
    maxX = Math.max(maxX, currentX);
    maxY = Math.max(maxY, currentY);
  };

  for (let index = 0; index < tokens.length;) {
    const token = tokens[index];
    if (isPathCommand(token)) {
      command = token;
      index += 1;
      if (command === 'Z' || command === 'z') {
        currentX = startX;
        currentY = startY;
        command = null;
      }
      continue;
    }

    if (!command || index + 1 >= tokens.length) break;
    const nextX = Number(token);
    const nextY = Number(tokens[index + 1]);
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) break;

    if (command === 'M' || command === 'L') {
      currentX = nextX;
      currentY = nextY;
    } else {
      currentX += nextX;
      currentY += nextY;
    }

    if (command === 'M' || command === 'm') {
      startX = currentX;
      startY = currentY;
      command = command === 'M' ? 'L' : 'l';
    }
    includePoint();
    index += 2;
  }

  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function calculateMapShapeViewBox(path: string) {
  const bounds = calculateMapShapeBounds(path);
  if (!bounds) return '0 0 100 100';
  const size = Math.max(bounds.width, bounds.height, 1);
  const padding = size * 0.16;
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const paddedSize = size + padding * 2;
  return `${centerX - paddedSize / 2} ${centerY - paddedSize / 2} ${paddedSize} ${paddedSize}`;
}
