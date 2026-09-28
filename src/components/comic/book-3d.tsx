/**
 * A CSS-only 3D book: front cover, page block and spine. Works with any cover
 * URL (no CORS needed, unlike WebGL textures).
 */
export function Book3D({ cover, title }: { cover: string; title: string }) {
  return (
    <div className="group [perspective:1400px]">
      <div className="preserve-3d relative aspect-[2/3] w-full transition-transform duration-700 ease-out [transform:rotateY(-24deg)_rotateX(4deg)] group-hover:[transform:rotateY(-8deg)_rotateX(0deg)]">
        {/* page block */}
        <div
          aria-hidden
          className="absolute inset-y-[1.5%] right-0 w-[28px] origin-right bg-[repeating-linear-gradient(90deg,#f1f5f9_0_2px,#cbd5e1_2px_3px)] [transform:rotateY(90deg)_translateX(14px)]"
        />
        {/* back cover */}
        <div aria-hidden className="absolute inset-0 rounded-r-lg bg-slate-800 [transform:translateZ(-28px)]" />
        {/* front cover */}
        <div className="absolute inset-0 overflow-hidden rounded-r-lg shadow-2xl shadow-primary/30 [transform:translateZ(0)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={title} className="size-full object-cover" />
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25" />
        </div>
      </div>
      <div aria-hidden className="mx-auto mt-6 h-4 w-3/4 rounded-[50%] bg-black/25 blur-md dark:bg-black/60" />
    </div>
  );
}
