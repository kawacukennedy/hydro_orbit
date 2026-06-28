export default function TankVisual({
  level,
  capacity,
  percent,
}: {
  level: number;
  capacity: number;
  percent: number;
}) {
  const tankH = 180;
  const tankW = 100;
  const waterH = (percent / 100) * (tankH - 20);
  const waterY = tankH - 10 - waterH;

  const color = percent < 15 ? '#ef4444' : percent < 35 ? '#f59e0b' : '#06b6d4';
  const bgColor = percent < 15 ? '#fef2f2' : percent < 35 ? '#fffbeb' : '#ecfeff';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={tankW + 20} height={tankH} viewBox={`0 0 ${tankW + 20} ${tankH}`}>
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color} stopOpacity={0.9} />
          </linearGradient>
          <clipPath id="tankClip">
            <rect x={10} y={10} width={tankW} height={tankH - 20} rx={8} />
          </clipPath>
        </defs>

        <rect x={10} y={10} width={tankW} height={tankH - 20} rx={8} fill={bgColor} stroke="#d1d5db" strokeWidth={2} />

        <g clipPath="url(#tankClip)">
          <rect x={10} y={waterY} width={tankW} height={waterH + 10} fill="url(#waterGrad)" opacity={0.85}>
            <animate attributeName="y" from={waterY - 2} to={waterY + 2} dur="3s" repeatCount="indefinite" />
          </rect>
          <ellipse cx={60} cy={waterY + 10} rx={tankW / 2} ry={6} fill={color} opacity={0.3}>
            <animate attributeName="ry" from={4} to={8} dur="3s" repeatCount="indefinite" />
            <animate attributeName="cy" from={waterY + 8} to={waterY + 12} dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={60} cy={waterY + 15} rx={tankW / 3} ry={4} fill={color} opacity={0.2}>
            <animate attributeName="rx" from={25} to={35} dur="4s" repeatCount="indefinite" />
            <animate attributeName="cy" from={waterY + 13} to={waterY + 17} dur="4s" repeatCount="indefinite" />
          </ellipse>
        </g>

        <rect x={45} y={4} width={30} height={10} rx={3} fill="#e5e7eb" stroke="#d1d5db" strokeWidth={1.5} />

        <text x={60} y={tankH / 2} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
          {percent}%
        </text>
      </svg>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{level.toLocaleString()}L</p>
        <p className="text-xs text-gray-500">of {capacity.toLocaleString()}L</p>
      </div>
    </div>
  );
}
