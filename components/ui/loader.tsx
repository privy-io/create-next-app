import * as React from "react"

const Loader = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 100 100"
    {...props}
  >
    <circle cx={15} cy={57.5} r={8} fill="currentColor">
      <animate
        attributeName="cy"
        begin="-0.6s"
        calcMode="spline"
        dur="1s"
        keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5"
        keyTimes="0;0.3;0.6;1"
        repeatCount="indefinite"
        values="57.5;42.5;57.5;57.5"
      />
    </circle>
    <circle cx={40} cy={57.5} r={8} fill="currentColor">
      <animate
        attributeName="cy"
        begin="-0.44999999999999996s"
        calcMode="spline"
        dur="1s"
        keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5"
        keyTimes="0;0.3;0.6;1"
        repeatCount="indefinite"
        values="57.5;42.5;57.5;57.5"
      />
    </circle>
    <circle cx={65} cy={57.5} r={8} fill="currentColor">
      <animate
        attributeName="cy"
        begin="-0.3s"
        calcMode="spline"
        dur="1s"
        keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5"
        keyTimes="0;0.3;0.6;1"
        repeatCount="indefinite"
        values="57.5;42.5;57.5;57.5"
      />
    </circle>
    <circle cx={90} cy={57.5} r={8} fill="currentColor">
      <animate
        attributeName="cy"
        begin="-0.15s"
        calcMode="spline"
        dur="1s"
        keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5"
        keyTimes="0;0.3;0.6;1"
        repeatCount="indefinite"
        values="57.5;42.5;57.5;57.5"
      />
    </circle>
  </svg>
)

export default Loader 