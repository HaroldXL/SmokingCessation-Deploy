import React from "react";

const AppointmentSVG = (props) => (
  <svg
    width={props.width || 120}
    height={props.height || 120}
    viewBox="0 0 120 120"
    fill="none"
    {...props}
  >
    <rect x="10" y="24" width="100" height="80" rx="14" fill="#e0f2fe" />
    <rect x="22" y="38" width="76" height="52" rx="8" fill="#fff" />
    <rect x="22" y="38" width="76" height="10" rx="4" fill="#bae6fd" />
    <rect x="32" y="54" width="16" height="8" rx="3" fill="#0d9488" />
    <rect x="52" y="54" width="16" height="8" rx="3" fill="#a7f3d0" />
    <rect x="72" y="54" width="16" height="8" rx="3" fill="#fef08a" />
    <rect x="32" y="68" width="16" height="8" rx="3" fill="#fca5a5" />
    <rect x="52" y="68" width="16" height="8" rx="3" fill="#fcd34d" />
    <rect x="72" y="68" width="16" height="8" rx="3" fill="#a5b4fc" />
    <rect x="40" y="18" width="8" height="16" rx="4" fill="#0d9488" />
    <rect x="72" y="18" width="8" height="16" rx="4" fill="#0d9488" />
  </svg>
);

export default AppointmentSVG;