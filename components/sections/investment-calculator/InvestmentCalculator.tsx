import { AnimatedText } from "@/components/ui/AnimatedText";
import { InvestmentSlider } from "./InvestmentSlider";

export function InvestmentCalculator() {
  return (
    <section
      className="relative z-10 mx-2 flex flex-col items-center rounded-[16px] bg-[#cbe0b8] px-4 py-20 sm:px-8 md:py-24 lg:py-[120px]"
     >
      <div className="flex w-full flex-col items-center gap-12 md:gap-16 lg:gap-[64px]">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Rang De is India's first social investment platform ~", className: "text-ink" },
            {
              text: "you fund rural businesses, help them grow, and earn meaningful returns while you do it.",
              className: "text-green-dark",
            },
          ]}
          className="w-full max-w-[1170px] text-center font-display text-[24px] font-bold leading-[28px] sm:text-h4 md:text-[36px] md:leading-[44px] lg:text-h3 lg:leading-[48px]"
        />

        <InvestmentSlider />
      </div>
    </section>
  );
}
