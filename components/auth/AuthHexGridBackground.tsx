/** Perspective hex barrier grid — colors from globals.css tokens */
export function AuthHexGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-background" />
      <div className="auth-hex-perspective absolute left-1/2 top-[42%] h-[240%] w-[240%] -translate-x-1/2 -translate-y-1/2">
        <div className="auth-hex-drift absolute inset-0" />
      </div>
      <div className="auth-hex-glow absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background" />
    </div>
  );
}
