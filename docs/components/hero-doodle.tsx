const DOODLE_PIXEL =
  "var(--font-vt323), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DOODLE_PIXEL_STRONG =
  "var(--font-press-start-2p), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export function HeroDoodle() {
  return (
    <div className="relative hidden w-full max-w-lg justify-self-end lg:block">
      <div className="relative p-8">
        <svg
          viewBox="16 155 384 424"
          aria-hidden
          className="bionicjs-float relative mx-auto h-[20rem] w-full max-w-[18rem] text-foreground/70"
          style={{ animationDuration: "10s" }}
          fill="none"
        >
          <defs>
            <linearGradient id="doodle-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="40%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="60%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
              <animate
                attributeName="x1"
                values="-1;1"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2"
                dur="4s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>

          <g transform="rotate(-5 86 266)">
            <rect
              x="30"
              y="210"
              width="112"
              height="112"
              rx="18"
              stroke="url(#doodle-beam)"
              strokeWidth="2.2"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <rect
              x="37"
              y="217"
              width="112"
              height="112"
              rx="16"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x="86"
              y="287"
              textAnchor="middle"
              fontFamily={DOODLE_PIXEL_STRONG}
              fontSize="46"
              fontWeight="700"
              fill="currentColor"
            >
              ts
            </text>
          </g>

          <path
            className="doodle-flow"
            d="M 140 236 C 156 220 172 218 188 214"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />
          <path
            className="doodle-flow"
            d="M 144 268 C 162 268 180 266 196 266"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />
          <path
            className="doodle-flow"
            d="M 140 298 C 152 314 170 332 188 348"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />

          <g transform="rotate(-3 244 216)">
            <rect
              x="188"
              y="190"
              width="112"
              height="52"
              rx="13"
              stroke="url(#doodle-beam)"
              strokeWidth="1.8"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <circle className="doodle-pulse" cx="210" cy="216" r="4" fill="currentColor" />
            <text x="226" y="222" fontFamily={DOODLE_PIXEL} fontSize="18" fill="currentColor">
              auth
            </text>
          </g>
          <g transform="rotate(2 250 288)">
            <rect
              x="196"
              y="262"
              width="108"
              height="52"
              rx="13"
              stroke="url(#doodle-beam)"
              strokeWidth="1.8"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <circle className="doodle-pulse" cx="218" cy="288" r="4" fill="currentColor" />
            <text x="234" y="294" fontFamily={DOODLE_PIXEL} fontSize="18" fill="currentColor">
              db
            </text>
          </g>
          <g transform="rotate(-4 244 360)">
            <rect
              x="188"
              y="334"
              width="112"
              height="52"
              rx="13"
              stroke="url(#doodle-beam)"
              strokeWidth="1.8"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <circle className="doodle-pulse" cx="210" cy="360" r="4" fill="currentColor" />
            <text x="226" y="366" fontFamily={DOODLE_PIXEL} fontSize="18" fill="currentColor">
              orm
            </text>
          </g>

          <path
            className="doodle-flow"
            d="M 246 396 C 270 414 300 428 322 440"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="5 8"
            opacity="0.6"
          />
          <path
            className="doodle-flow"
            d="M 318 448 l 18 3 -12 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 8"
            opacity="0.6"
          />

          <g transform="rotate(5 331 478)">
            <rect
              x="275"
              y="420"
              width="112"
              height="112"
              rx="18"
              stroke="url(#doodle-beam)"
              strokeWidth="2.2"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <rect
              x="282"
              y="427"
              width="112"
              height="112"
              rx="16"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x="331"
              y="497"
              textAnchor="middle"
              fontFamily={DOODLE_PIXEL_STRONG}
              fontSize="46"
              fontWeight="700"
              fill="currentColor"
            >
              py
            </text>
          </g>

          <path
            className="doodle-flow"
            d="M 272 460 C 250 452 232 462 216 470"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />
          <path
            className="doodle-flow"
            d="M 322 534 C 286 528 246 516 206 514"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />

          <g transform="rotate(-3 202 458)">
            <rect
              x="150"
              y="432"
              width="104"
              height="52"
              rx="13"
              stroke="url(#doodle-beam)"
              strokeWidth="1.8"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <circle className="doodle-pulse" cx="170" cy="458" r="4" fill="currentColor" />
            <text x="186" y="464" fontFamily={DOODLE_PIXEL} fontSize="18" fill="currentColor">
              ai
            </text>
          </g>
          <g transform="rotate(3 187 536)">
            <rect
              x="120"
              y="510"
              width="134"
              height="52"
              rx="13"
              stroke="url(#doodle-beam)"
              strokeWidth="1.8"
              fill="currentColor"
              fillOpacity="0.05"
            />
            <circle className="doodle-pulse" cx="144" cy="536" r="4" fill="currentColor" />
            <text x="160" y="542" fontFamily={DOODLE_PIXEL} fontSize="18" fill="currentColor">
              jobs
            </text>
          </g>

          <path
            d="M 352 186 l 9 2 M 356 180 l 2 9 M 349 184 l 10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 66 184 C 60 178 70 172 76 178 C 82 184 74 192 66 187 C 57 182 62 172 72 174"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 356 300 l 10 10 M 366 300 l -10 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>
      </div>
    </div>
  );
}
