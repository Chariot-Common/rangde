import type { Metadata, Viewport } from "next";
import { Geist, Inter, Parkinsans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { TopNav } from "@/components/layout/TopNav";
import { FloatingGetStarted } from "@/components/layout/FloatingGetStarted";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/layout/PageLoader";
import { HowItWorksProvider } from "@/components/how-it-works/HowItWorksContext";
import { HowItWorksModal } from "@/components/how-it-works/HowItWorksModal";
import { StatsProvider } from "@/components/providers/StatsProvider";
import { getRangDeStats } from "@/lib/stats";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["500", "700"],
});

// Phones in landscape: without "cover", iOS letterboxes the whole page inside the safe area, so
// every section looks capped at a max width with wide empty bands at the sides. With it the page
// runs edge to edge, and the root wrapper below pads in only as much as the notch needs.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Rang De | Invest in rural entrepreneurs, get repaid with interest",
  description:
    "Rang De bridges the gap between urban investors and rural India, turning investments into livelihoods and livelihoods into returns.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Live headline numbers from rangde.in (refreshed every 10 minutes), shared with every section.
  const stats = await getRangDeStats();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${parkinsans.variable} ${geist.variable} antialiased`}
    >
      <body>
        {/* Always open at the top: on a reload the browser would otherwise put the reader back
            wherever they last were (e.g. deep in the opportunities section). Runs while the HTML
            is still parsing, before the browser restores the old position. Links to a section
            (#opportunities) still land on it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "history.scrollRestoration='manual';if(!location.hash)window.scrollTo(0,0);",
          }}
        />
        <PageLoader />
        <StatsProvider stats={stats}>
        <HowItWorksProvider>
          {/* Sections already sit 8px in with ~32px of inner padding, so only the part of the
              notch's safe-area inset beyond that is added here: cards reach close to the screen
              edge while their text stays clear of the notch. 0 on every non-notched screen. */}
          <div className="mx-auto flex min-h-screen w-full flex-col overflow-x-clip pl-[max(0px,calc(env(safe-area-inset-left)-32px))] pr-[max(0px,calc(env(safe-area-inset-right)-32px))]">
            {/* Normal document flow — scrolls away with the page, unlike the navbar below. */}
            <AnnouncementBar />
            <header className="sticky top-0 z-[100]">
              <TopNav />
            </header>
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FloatingGetStarted />
          <HowItWorksModal />
        </HowItWorksProvider>
        </StatsProvider>
      </body>
    </html>
  );
}
