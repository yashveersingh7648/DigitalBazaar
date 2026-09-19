import React from "react";

// Reference design ke "girl with shopping bags" hero visual ka safe, original illustration —
// asli photo/model reproduce karne ke bajaye, colorful floating shopping bags banaye hain
// (wahi navy/orange/yellow/blue color mood), har bag alag speed se float karta hai.
export default function BagIllustration() {
  return (
    <svg
      className="bag-illustration"
      viewBox="0 0 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="bag bag-navy">
        <path d="M118 150h64l8 130h-80z" fill="#2b3a67" />
        <path d="M128 150c0-16 8-28 22-28s22 12 22 28" stroke="#fff" strokeWidth="6" fill="none" />
      </g>
      <g className="bag bag-orange">
        <path d="M188 168h70l9 118h-88z" fill="#ea8b50" />
        <path d="M199 168c0-15 9-26 24-26s24 11 24 26" stroke="#fff" strokeWidth="6" fill="none" />
      </g>
      <g className="bag bag-yellow">
        <path d="M96 196h60l7 96h-74z" fill="#f2c94c" />
        <path d="M105 196c0-13 8-23 21-23s21 10 21 23" stroke="#5c4d6b" strokeWidth="5" fill="none" />
      </g>
      <g className="bag bag-blue">
        <path d="M170 214h74l9 108h-92z" fill="#2f5bda" />
        <path d="M182 214c0-15 9-27 25-27s25 12 25 27" stroke="#fff" strokeWidth="6" fill="none" />
      </g>
      <g className="bag bag-white">
        <path d="M62 176h56l6 92h-68z" fill="#ffffff" stroke="#e5d9ec" strokeWidth="2" />
        <path d="M71 176c0-13 8-22 19-22s19 9 19 22" stroke="#2b3a67" strokeWidth="5" fill="none" />
        <path d="M62 200h68M62 216h68" stroke="#2b3a67" strokeWidth="3" opacity="0.5" />
      </g>
    </svg>
  );
}
