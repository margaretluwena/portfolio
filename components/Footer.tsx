import CopyEmailButton from './CopyEmailButton'

const EMAIL = 'luwena@usc.edu'

export default function Footer() {
  return (
    <footer className="bg-black px-6 md:px-12 pt-24 pb-6 overflow-hidden">
      {/* Top row: copy + email actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-20">
        <div />
        <p className="text-white font-inter text-base md:text-lg leading-snug max-w-md md:justify-self-end">
          Feel free to reach out with any questions about me or my work!
        </p>
      </div>

      <div className="flex justify-end mb-24">
        <div className="flex items-center gap-3">
          <a
            href={`mailto:${EMAIL}`}
            className="bg-white text-black rounded-full px-5 py-2.5 text-sm font-roboto-condensed tracking-wide hover:bg-white/90 transition-[background-color] duration-[var(--duration-base,500ms)] [transition-timing-function:var(--ease-out-expo,cubic-bezier(0.22,1,0.36,1))]"
          >
            {EMAIL}
          </a>
          <CopyEmailButton />
        </div>
      </div>

      {/* Social links anchored to the bottom corners */}
      <div className="flex items-end justify-between mb-4">
        <a
          href="https://www.instagram.com/margaret.luwena/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-roboto-condensed tracking-[0.25em] uppercase inline-flex items-center gap-1 transition-colors duration-[var(--duration-base,500ms)] [transition-timing-function:var(--ease-out-expo,cubic-bezier(0.22,1,0.36,1))]"
        >
          INSTA <span aria-hidden="true">↗</span>
        </a>
        <a
          href="https://www.linkedin.com/in/margaretluwena/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-roboto-condensed tracking-[0.25em] uppercase inline-flex items-center gap-1 transition-colors duration-[var(--duration-base,500ms)] [transition-timing-function:var(--ease-out-expo,cubic-bezier(0.22,1,0.36,1))]"
        >
          LNKDN <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Wordmark — tight tracking so letters touch */}
      <p
        className="font-unbounded font-black text-white uppercase leading-[0.85] text-center w-full select-none"
        style={{ fontSize: 'clamp(3.5rem, 18vw, 22rem)', letterSpacing: '-0.05em' }}
      >
        MARGARET LUWENA
      </p>
    </footer>
  )
}
