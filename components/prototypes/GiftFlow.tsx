"use client";

import Image from "next/image";
import { useState } from "react";
import { LegacyButton as Button } from "@/components/ui/LegacyButton";
import { formatInr } from "@/lib/investment-calculator";
import { imgix, type IndividualOpportunity } from "@/lib/opportunities";
import { AMOUNT_OPTIONS, Chip, EntrepreneurPicker, INPUT_CLASS, Notice, StepCard } from "./shared";

const OCCASIONS = [
  { label: "Birthday", message: "Happy birthday! Instead of something that sits on a shelf, I’ve backed someone’s livelihood in your name." },
  { label: "Thank you", message: "Thank you for everything. I’ve backed someone building their own livelihood in your name." },
  { label: "Festival", message: "Wishing you a bright festival. This year’s gift is a chance for someone to grow their business." },
  { label: "Anniversary", message: "Here’s to us. I’ve backed someone building their own livelihood in your name." },
];

export function GiftFlow({ entrepreneurs }: { entrepreneurs: IndividualOpportunity[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(entrepreneurs[0]?.key ?? null);
  const [amount, setAmount] = useState(2_000);
  const [occasion, setOccasion] = useState(0);
  const [message, setMessage] = useState(OCCASIONS[0].message);
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [sent, setSent] = useState(false);

  const person = entrepreneurs.find((o) => o.key === selectedKey) ?? null;
  const interest = person ? Math.round(amount * (person.returnRate / 100) * (person.tenureMonths / 12)) : 0;

  function chooseOccasion(i: number) {
    setOccasion(i);
    setMessage(OCCASIONS[i].message);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col gap-4">
        <StepCard n={1} title="Choose who your gift backs" hint="Your gift funds this entrepreneur’s loan.">
          <EntrepreneurPicker items={entrepreneurs} selectedKey={selectedKey} onSelect={setSelectedKey} />
        </StepCard>

        <StepCard n={2} title="Choose an amount">
          <div className="flex flex-wrap gap-2">
            {AMOUNT_OPTIONS.map((a) => (
              <Chip key={a} active={amount === a} onClick={() => setAmount(a)}>
                {formatInr(a)}
              </Chip>
            ))}
          </div>
        </StepCard>

        <StepCard n={3} title="Make it personal">
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o, i) => (
              <Chip key={o.label} active={occasion === i} onClick={() => chooseOccasion(i)}>
                {o.label}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-display text-p3 font-bold text-ink">Their name</span>
              <input className={INPUT_CLASS} placeholder="Who is it for?" value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={30} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-display text-p3 font-bold text-ink">Your name</span>
              <input className={INPUT_CLASS} placeholder="Who is it from?" value={sender} onChange={(e) => setSender(e.target.value)} maxLength={30} />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-display text-p3 font-bold text-ink">Your note</span>
            <textarea
              className={`${INPUT_CLASS} h-[112px] resize-none py-3`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
            />
          </label>
        </StepCard>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--navbar-bottom,0px)+16px)]">
        <div className="overflow-hidden rounded-[16px] bg-gradient-to-b from-[#FFF1C7] to-white shadow-[0px_4px_16px_rgba(41,45,54,0.08)]">
          {person ? (
            <>
              <div className="relative aspect-[16/9] w-full bg-ink/8">
                <Image src={imgix(person.photo, 640, 360)} alt="" fill unoptimized sizes="420px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/56 to-transparent" />
                <p className="absolute bottom-3 left-4 font-display text-p3 font-bold text-white">
                  {person.name} · {person.district}, {person.state}
                </p>
              </div>
              <div className="flex flex-col gap-4 p-6">
                <p className="font-display text-p4 font-bold uppercase tracking-[0.88px] text-green-dark">
                  A gift for {recipient.trim() || "someone special"}
                </p>
                <p className="font-display text-h4 font-bold text-ink">{formatInr(amount)} invested in a livelihood</p>
                <p className="font-display text-p3 font-medium italic text-ink/80">“{message || "Add a note"}”</p>
                <p className="font-display text-p4 font-bold text-ink/64">From {sender.trim() || "a friend"}</p>
                <div className="h-px w-full bg-ink/16" />
                <p className="font-display text-p4 font-medium text-ink/64">
                  Backs: {person.purpose} Estimated interest {formatInr(interest)} at {person.returnRate}% p.a. over {person.tenureMonths} months.
                </p>
              </div>
            </>
          ) : (
            <p className="p-6 font-display text-p3 font-medium text-ink/64">Choose someone to back to preview the gift.</p>
          )}
        </div>

        {sent ? (
          <Notice tone="blue" title="Gift ready to send">
            {recipient.trim() || "Your recipient"} would get this gift by message, with a link to follow {person?.name}’s progress.
          </Notice>
        ) : (
          <Button type="button" size="lg" className="w-full !px-6" disabled={!person} onClick={() => setSent(true)}>
            Send gift
          </Button>
        )}
        {sent && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setSent(false)}>
            Edit gift
          </Button>
        )}

        <Notice tone="amber" title="Still to settle">
          Who receives the repayments, and whether the recipient needs their own verified account, are open questions.
        </Notice>
        <p className="font-display text-p4 font-medium text-ink/48">Concept prototype. Figures are illustrative and nothing is saved or sent.</p>
      </aside>
    </div>
  );
}
