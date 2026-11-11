import Image from "next/image";
import { footerLegalLinks, footerNavLinks } from "@/lib/content";

export function Footer() {
  return (
    // As much room above the logo as below the footer (it sat flush against the last section, which cut into it).
    <footer className="mx-auto flex w-full max-w-[1170px] flex-col gap-12 px-4 pb-12 pt-12 sm:gap-16 sm:px-6 sm:pb-16 sm:pt-16 lg:gap-[80px] lg:pb-[80px] lg:pt-[80px]">
      <div className="flex flex-col items-center gap-[24px]">
        {/* The tree in grey; hovered, it fades to its own colours (rangde-logo-footer-colour.svg: the same paths, coloured
            as in the nav's logo). */}
        <div className="group relative h-[80px] w-[70px] sm:h-[100px] sm:w-[88px]">
          <Image src="/icons/rangde-logo-footer.svg" alt="Rang De" fill className="object-contain transition-opacity duration-300 group-hover:opacity-0" />
          <Image src="/icons/rangde-logo-footer-colour.svg" alt="" aria-hidden fill className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="flex flex-col items-center gap-[48px]">
          <nav className="flex flex-wrap items-start justify-center gap-x-8 gap-y-4 sm:gap-[48px]">
            {footerNavLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="whitespace-nowrap font-display text-p1 font-bold text-ink transition-opacity hover:opacity-70"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-[24px]">
            <div className="flex flex-wrap items-center justify-center gap-x-[16px] gap-y-2 whitespace-nowrap font-display text-p4 font-bold text-ink/56 sm:items-center">
              <span>Impact Partners</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>In the Press</span>
            </div>
            <div className="relative h-[18px] w-[204px] sm:h-[20px] sm:w-[226px]">
              <Image
                src="/icons/social-icons-row.svg"
                alt="Follow Rang De on social media"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-ink/16" />

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-[24px]">
        <div className="flex w-full max-w-[670px] gap-[16px]">
          <div className="relative h-[40px] w-[40px] shrink-0 opacity-40 sm:h-[48px] sm:w-[48px]">
            <Image src="/icons/footer-legal-seal.webp" alt="RBI" fill sizes="48px" className="object-contain" />
          </div>
          <div className="flex flex-1 flex-col gap-[16px] font-display text-[10px] font-medium leading-[16px] text-ink/48">
            <p>Rang De is an RBI registered NBFC P2P platform vide Certificate of Registration (COR) No. : N - 02-00319</p>
            <p>
              Reserve Bank of India does not accept any responsibility for the correctness of any of the statements or
              representations made or opinions expressed by Rang De P2P Financial Services Pvt. Ltd, and does not provide
              any assurance for repayment of the loans lent on it.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[16px] text-left font-display text-[10px] text-ink/48 sm:items-end sm:text-right">
          <p className="whitespace-nowrap font-medium leading-[16px]">&copy; 2024, Rang De P2P Financial Services Pvt. Ltd.</p>
          <p className="max-w-[370px] font-normal leading-[16px]">
            {footerLegalLinks.map((link, i) => (
              <span key={link}>
                <a href="#" className="underline decoration-from-font hover:text-ink/80">
                  {link}
                </a>
                {i < footerLegalLinks.length - 1 && "   ·   "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
