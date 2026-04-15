type Props = { className?: string };

export function LogoMark({ className }: Props) {
  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="1024" height="1024" rx="230" fill="#F7F5F1" />
      <rect x="148" y="310" width="310" height="490" fill="#0A1628" />
      <polygon points="148,310 303,175 458,310" fill="#0A1628" />
      <rect x="390" y="400" width="140" height="400" fill="#162236" />
      <rect x="278" y="448" width="58" height="52" fill="#9B7B4E" />
      <rect x="484" y="278" width="388" height="494" fill="#EDE9E3" />
      <rect x="484" y="278" width="7" height="494" fill="#9B7B4E" />
      <rect x="518" y="312" width="320" height="144" fill="#0A1628" />
      <rect x="538" y="346" width="210" height="12" fill="#D4B896" opacity="0.95" />
      <rect x="518" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
      <rect x="600" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
      <rect x="682" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
    </svg>
  );
}

export function AppIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <rect id="r" width="1024" height="1024" rx="230" ry="230" />
        <clipPath id="c">
          <use href="#r" />
        </clipPath>
      </defs>
      <use href="#r" fill="#F7F5F1" />
      <g clipPath="url(#c)">
        <g stroke="#9B7B4E" strokeWidth="1" opacity="0.06">
          <line x1="0" y1="60" x2="1024" y2="60" />
          <line x1="0" y1="120" x2="1024" y2="120" />
          <line x1="0" y1="180" x2="1024" y2="180" />
          <line x1="0" y1="240" x2="1024" y2="240" />
          <line x1="0" y1="300" x2="1024" y2="300" />
          <line x1="0" y1="360" x2="1024" y2="360" />
          <line x1="0" y1="420" x2="1024" y2="420" />
          <line x1="0" y1="480" x2="1024" y2="480" />
          <line x1="60" y1="0" x2="60" y2="1024" />
          <line x1="120" y1="0" x2="120" y2="1024" />
          <line x1="180" y1="0" x2="180" y2="1024" />
          <line x1="240" y1="0" x2="240" y2="1024" />
          <line x1="300" y1="0" x2="300" y2="1024" />
          <line x1="360" y1="0" x2="360" y2="1024" />
          <line x1="420" y1="0" x2="420" y2="1024" />
          <line x1="480" y1="0" x2="480" y2="1024" />
        </g>
        <rect x="148" y="310" width="310" height="490" fill="#0A1628" />
        <polygon points="148,310 303,175 458,310" fill="#0A1628" />
        <rect x="390" y="400" width="140" height="400" fill="#162236" />
        <rect x="192" y="358" width="58" height="52" fill="#EDE9E3" opacity="0.7" />
        <rect x="278" y="358" width="58" height="52" fill="#EDE9E3" opacity="0.7" />
        <rect x="192" y="448" width="58" height="52" fill="#EDE9E3" opacity="0.7" />
        <rect x="278" y="448" width="58" height="52" fill="#9B7B4E" />
        <rect x="192" y="538" width="58" height="52" fill="#EDE9E3" opacity="0.7" />
        <rect x="278" y="538" width="58" height="52" fill="#EDE9E3" opacity="0.7" />
        <rect x="263" y="692" width="80" height="108" fill="#162236" />
        <rect x="484" y="278" width="388" height="494" fill="#EDE9E3" />
        <rect x="484" y="278" width="388" height="494" fill="none" stroke="#0A1628" strokeWidth="4" />
        <rect x="484" y="278" width="7" height="494" fill="#9B7B4E" />
        <rect x="518" y="312" width="320" height="144" fill="#0A1628" />
        <rect x="538" y="346" width="210" height="12" fill="#D4B896" opacity="0.95" />
        <rect x="538" y="373" width="130" height="8" fill="#D4B896" opacity="0.5" />
        <rect x="518" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="600" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="682" y="482" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="764" y="482" width="68" height="50" fill="#9B7B4E" opacity="0.18" />
        <rect x="518" y="548" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="600" y="548" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="682" y="548" width="66" height="50" fill="#0A1628" opacity="0.75" />
        <rect x="764" y="614" width="68" height="116" fill="#0A1628" />
        <rect x="782" y="652" width="32" height="6" fill="#B8976A" />
        <rect x="782" y="666" width="32" height="6" fill="#B8976A" />
      </g>
    </svg>
  );
}
