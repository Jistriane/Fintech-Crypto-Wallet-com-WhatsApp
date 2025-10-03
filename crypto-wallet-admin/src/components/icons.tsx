"use client"

import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  LogOut,
  type LucideIcon 
} from "lucide-react"

// Importando os ícones das redes
function EthIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g fill="none" fillRule="evenodd">
        <circle cx="16" cy="16" r="16" fill="#627EEA"/>
        <g fill="#FFF" fillRule="nonzero">
          <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
          <path d="M16.498 4L9 16.22l7.498-3.35z"/>
          <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
          <path d="M16.498 27.995v-6.028L9 17.616z"/>
          <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
          <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
        </g>
      </g>
    </svg>
  );
}

function PolygonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g fill="none">
        <circle cx="16" cy="16" r="16" fill="#8247E5"/>
        <path d="M21.092 13.12c-.43-.226-.974-.226-1.404 0l-2.579 1.368-1.751.923-2.579 1.368c-.43.226-.974.226-1.404 0l-2.028-1.09c-.43-.226-.697-.646-.697-1.103V12.22c0-.456.267-.876.697-1.103l2.006-1.067c.43-.226.974-.226 1.404 0l2.006 1.067c.43.226.697.646.697 1.103v1.368l1.751-.923v-1.368c0-.456-.267-.876-.697-1.103l-3.735-1.99c-.43-.226-.974-.226-1.404 0L8.947 9.99C8.517 10.216 8.25 10.636 8.25 11.093v3.98c0 .456.267.876.697 1.103l3.757 1.99c.43.226.974.226 1.404 0l2.579-1.368 1.751-.923 2.579-1.368c.43-.226.974-.226 1.404 0l2.006 1.067c.43.226.697.646.697 1.103v2.266c0 .456-.267.876-.697 1.103l-2.006 1.067c-.43.226-.974.226-1.404 0l-2.006-1.067c-.43-.226-.697-.646-.697-1.103v-1.368l-1.751.923v1.368c0 .456.267.876.697 1.103l3.757 1.99c.43.226.974.226 1.404 0l3.757-1.99c.43-.226.697-.646.697-1.103v-3.98c0-.456-.267-.876-.697-1.103l-3.779-1.99z" fill="#FFF"/>
      </g>
    </svg>
  );
}

function BNBIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g fill="none">
        <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
        <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z" fill="#FFF"/>
      </g>
    </svg>
  );
}

function ArbitrumIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <g fill="none">
        <circle cx="16" cy="16" r="16" fill="#2D374B"/>
        <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm4.176 16.527h-.488l-2.816-4.528-.437-.707-.036.043v5.192h-.532V11.71h.488l2.817 4.529.436.707.037-.043v-5.193h.531v8.817zm-6.487-8.817l-2.991 8.817h-.572l2.991-8.817h.572z" fill="#FFF"/>
      </g>
    </svg>
  );
}

export type Icon = LucideIcon

export const Icons = {
  spinner: Loader2,
  check: CheckCircle,
  alert: AlertCircle,
  wallet: Wallet,
  logout: LogOut,
  eth: EthIcon,
  polygon: PolygonIcon,
  bnb: BNBIcon,
  arbitrum: ArbitrumIcon,
} as const