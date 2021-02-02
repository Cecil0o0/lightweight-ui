export function arrayMove(items: any[], oldIndex: number, newIndex: number) {
  const array = items.slice();
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
}

export const fontFamily = `-apple-system, BlinkMacSystemFont, Helvetica Neue, Tahoma, PingFang SC,
Microsoft Yahei, Arial, Hiragino Sans GB, sans-serif`

let ctx: CanvasRenderingContext2D | null = null
export function getCanvasCtx() {
  if (ctx !== null) return ctx

  const canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  return ctx as CanvasRenderingContext2D
}

export function measureTextWidth(
  text: string,
  {
    fontSize = 12,
    fontWeight = 'normal'
  }: {
    fontSize?: number
    fontWeight?: number | 'normal' | 'bold' | 'lighter' | 'bolder'
  } = {}
) {
  const context = getCanvasCtx()
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  return context.measureText(text).width
}

export function getScrollbarSize() {
  const scrollDiv = document.createElement('div');

  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.width = '50px';
  scrollDiv.style.height = '50px';
  scrollDiv.style.overflow = 'scroll';

  document.body.appendChild(scrollDiv);
  const size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return size;
}

export function hex2Rgb(hex: string) {
  const rgb: number[] = [];

  hex = hex.substr(1); // 去除前缀 # 号

  if (hex.length === 3) {
    // 处理 "#abc" 成 "#aabbcc"
    hex = hex.replace(/(.)/g, '$1$1');
  }

  hex.replace(/../g, (color: string): string => {
    rgb.push(parseInt(color, 0x10)); // 按16进制将字符串转换为数字
    // 只是为了去除警告
    return '';
  });

  return rgb;
}

export function fade(color: string, opacity: string | number): string {
  return `rgba(${hex2Rgb(color).join(',')}, ${opacity})`;
}
