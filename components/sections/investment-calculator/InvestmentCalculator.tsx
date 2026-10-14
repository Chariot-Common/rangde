import { AnimatedText } from "@/components/ui/AnimatedText";
import { InvestmentSlider } from "./InvestmentSlider";

export function InvestmentCalculator() {
  return (
    <section
      className="relative z-10 mx-2 flex flex-col items-center rounded-[8px] px-4 py-20 sm:px-8 md:py-24 lg:py-[120px]"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(98, 175, 29, 0.24), rgba(98, 175, 29, 0.24)), linear-gradient(0deg, #ffffff, #ffffff)",
      }}
    >
      <div className="flex w-full flex-col items-center gap-12 md:gap-16 lg:gap-[76px]">
        <AnimatedText
          as="h2"
          segments={[
            { text: "Rang De is India's first social investment platform ~", className: "text-ink" },
            {
              text: "you fund rural businesses, help them grow, and earn meaningful returns while you do it.",
              className: "text-green-dark",
            },
          ]}
          className="w-full max-w-[1170px] text-center font-display text-[28px] font-bold leading-[32px] sm:text-h4 md:text-[36px] md:leading-[44px] lg:text-h3"
        />

        <InvestmentSlider />
      </div>
    </section>
  );
}
