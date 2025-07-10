// 타입별 색상 정의
export const typeColors = {
  text: '#0066ff',      // 파란색
  image: '#ff6b6b',     // 빨간색
  icon: '#ff9f43',      // 주황색
  link: '#9b59b6',      // 보라색
  repeat: '#00d2d3',    // 청록색
  block: '#576574',     // 회색
  section: '#ee5a24'    // 주황빨간색
};

export function getTypeColor(type: string | null): string {
  if (!type) return typeColors.text;
  return typeColors[type as keyof typeof typeColors] || typeColors.text;
}