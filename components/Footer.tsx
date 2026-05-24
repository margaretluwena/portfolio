import CopyEmailButton from './CopyEmailButton'

const EMAIL = 'luwena@usc.edu'

export default function Footer() {
  return (
    <footer className="bg-black pt-24 pb-6 overflow-hidden">
      {/* Reach-out copy + email actions — eyebrow left, content locked right */}
      <div className="px-6 md:px-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <p className="eyebrow">Get in touch</p>
          <div>
            <p className="text-white font-inter text-base md:text-lg leading-snug max-w-md mb-6">
              Feel free to reach out with any questions about me or my work!
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`mailto:${EMAIL}`}
                className="bg-white text-black rounded-full px-5 py-2.5 text-sm font-roboto-condensed tracking-wide hover:bg-white/90 transition-colors t-smooth"
              >
                {EMAIL}
              </a>
              <CopyEmailButton />
            </div>
          </div>
        </div>
      </div>

      {/* Social links anchored to the bottom corners */}
      <div className="px-6 md:px-12 flex items-end justify-between mb-4">
        <a
          href="https://www.instagram.com/margaret.luwena/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-roboto-condensed tracking-[0.25em] uppercase inline-flex items-center gap-1 transition-colors t-smooth"
        >
          INSTA <span aria-hidden="true">↗</span>
        </a>
        <a
          href="https://www.linkedin.com/in/margaretluwena/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-xs font-roboto-condensed tracking-[0.25em] uppercase inline-flex items-center gap-1 transition-colors t-smooth"
        >
          LNKDN <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Wordmark — full-width, single line, edge-to-edge, lighter weight */}
      <div className="overflow-hidden">
        <p
          className="font-unbounded font-normal text-white uppercase leading-[0.9] text-center w-full select-none whitespace-nowrap"
          style={{ fontSize: '7.65vw', letterSpacing: 'var(--tracking-display)' }}
        >
          MARGARET LUWENA
        </p>
      </div>
    </footer>
  )
}
