import type { Metadata } from "next";
import { Geist, Inter, Parkinsans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { TopNav } from "@/components/layout/TopNav";
import { FloatingGetStarted } from "@/components/layout/FloatingGetStarted";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/layout/PageLoader";
import { HowItWorksProvider } from "@/components/how-it-works/HowItWorksContext";
import { HowItWorksModal } from "@/components/how-it-works/HowItWorksModal";
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

export const metadata: Metadata = {
  title: "Rang De | Invest in rural entrepreneurs, get repaid with interest",
  description:
    "Rang De bridges the gap between urban investors and rural India, turning investments into livelihoods and livelihoods into returns.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${parkinsans.variable} ${geist.variable} antialiased`}
    >
      <body>
        <PageLoader />
        <HowItWorksProvider>
          <div className="mx-auto flex min-h-screen w-full flex-col overflow-x-clip">
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
      </body>
    </html>
  );
}
