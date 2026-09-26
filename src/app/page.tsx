import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <ExamsStrip />
        <Features />
        <Testimonial />
        <CtaBanner />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
      <div>
        <h1 className="font-display text-4xl font-medium leading-[1.1] text-ink md:text-5xl">
          Build a rank, not just a schedule.
        </h1>
        <p className="mt-6 max-w-md text-lg text-slate">
          Live classes, doubt support that answers you in minutes, and tests that tell you exactly
          where you stand — for JEE, NEET and Board exams.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-amber px-7 py-3 text-sm font-medium text-ink transition-colors hover:brightness-95"
          >
            Start learning free
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-ink underline underline-offset-4 hover:text-slate"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate">
          Over 12,000 students are preparing for JEE, NEET and Boards on LGIONRISE.
        </p>
      </div>
      <LiveClassCard />
    </section>
  );
}

function LiveClassCard() {
  return (
    <div className="rounded-2xl border border-rule-dark bg-ink p-6 text-paper shadow-[0_20px_60px_-20px_rgba(16,25,46,0.5)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-soft">
          <span className="h-2 w-2 rounded-full bg-amber-soft" />
          Live now
        </span>
        <span className="text-xs text-paper/60">Batch: NEET 2027</span>
      </div>
      <p className="mt-5 font-display text-xl font-medium">Human Physiology — Cardiac Cycle</p>
      <p className="mt-1 text-sm text-paper/60">Dr. Meera Kulkarni</p>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-soft px-4 py-3">
        <div>
          <p className="text-xs text-paper/60">Next doubt answered in</p>
          <p className="font-display text-lg">00:42</p>
        </div>
        <div className="flex -space-x-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-teal text-xs">
            RS
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-amber text-xs text-ink">
            AK
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-slate text-xs">
            +38
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-paper/80">
        <p>&ldquo;Sir, why does the QRS complex not match the P wave here?&rdquo;</p>
        <p className="text-amber-soft">— answered live, 41 seconds ago</p>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", title: "Enrol in a batch", body: "Pick your exam and class, and join a batch with a fixed teacher and schedule." },
    { n: "2", title: "Attend live classes", body: "Join from your phone or laptop, raise a doubt mid-class, and get it answered before the topic moves on." },
    { n: "3", title: "Track your rank", body: "Every test shows your percentile against your batch and against toppers — not just a score." },
  ];

  return (
    <section id="how-it-works" className="border-t border-rule">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-medium text-ink">How it works</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className={i > 0 ? "border-t border-rule pt-6 md:border-t-0 md:border-l md:pl-8 md:pt-0" : ""}
            >
              <p className="font-display text-sm text-amber">{step.n}</p>
              <p className="mt-2 text-lg font-medium text-ink">{step.title}</p>
              <p className="mt-2 text-sm text-slate">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExamsStrip() {
  const exams = [
    { name: "JEE Main & Advanced", stat: "4,800+ students" },
    { name: "NEET", stat: "5,600+ students" },
    { name: "Boards — Class 10 & 12", stat: "1,900+ students" },
  ];

  return (
    <section id="exams" className="border-t border-rule bg-paper-dim">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.name}>
              <p className="font-display text-2xl font-medium text-ink">{exam.name}</p>
              <p className="mt-1 text-sm text-slate">{exam.stat}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <FeatureRow
        title="Ask a doubt mid-lecture, get it answered before the topic moves on"
        body="Text, photo or voice — send your doubt from inside the live class or a recorded lecture, and your teacher or a subject expert replies without you losing your place."
        mockup={<DoubtMockup />}
        reverse={false}
      />
      <FeatureRow
        title="Every test tells you exactly where you'd rank"
        body="Not just a score out of 100 — your percentile against your batch, your weak topics, and how far you are from the students above you."
        mockup={<RankMockup />}
        reverse
      />
      <FeatureRow
        title="Download once, revise anywhere — even with no signal"
        body="Notes, DPPs and past papers stay on your phone after you download them, so a train journey or a low-network hostel room never costs you a revision session."
        mockup={<DownloadMockup />}
        reverse={false}
      />
    </section>
  );
}

function FeatureRow({
  title,
  body,
  mockup,
  reverse,
}: {
  title: string;
  body: string;
  mockup: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-12 border-t border-rule py-16 first:border-t-0 md:grid-cols-2 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>{mockup}</div>
      <div>
        <h3 className="font-display text-2xl font-medium leading-snug text-ink md:text-3xl">{title}</h3>
        <p className="mt-4 max-w-md text-slate">{body}</p>
      </div>
    </div>
  );
}

function DoubtMockup() {
  return (
    <div className="rounded-2xl border border-rule bg-paper p-5">
      <div className="space-y-3">
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-sm text-paper">
          Why is the induced EMF negative here?
        </div>
        <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-paper-dim px-4 py-2.5 text-sm text-ink">
          That&apos;s Lenz&apos;s law — the induced current opposes the change in flux. Re-check the direction of B.
        </div>
        <div className="flex items-center gap-2 text-xs text-slate">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          Answered in 3 minutes
        </div>
      </div>
    </div>
  );
}

function RankMockup() {
  const bars = [62, 78, 45, 91, 70];
  return (
    <div className="rounded-2xl border border-rule bg-paper p-6">
      <p className="text-sm text-slate">Physics — Full Syllabus Test 4</p>
      <p className="mt-1 font-display text-2xl font-medium text-ink">Percentile 94.2</p>
      <div className="mt-6 flex items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1">
            <div className={`rounded-t-md ${i === 3 ? "bg-amber" : "bg-paper-dim"}`} style={{ height: `${h}px` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate">Your score vs. last 4 attempts</p>
    </div>
  );
}

function DownloadMockup() {
  const files = [
    { name: "Organic Chemistry — Notes.pdf", size: "2.1 MB" },
    { name: "Mechanics DPP 12.pdf", size: "640 KB" },
    { name: "NEET 2025 Paper.pdf", size: "1.8 MB" },
  ];
  return (
    <div className="rounded-2xl border border-rule bg-paper p-5">
      <ul className="space-y-3">
        {files.map((f) => (
          <li key={f.name} className="flex items-center justify-between text-sm">
            <span className="text-ink">{f.name}</span>
            <span className="text-xs text-teal">Downloaded · {f.size}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Testimonial() {
  return (
    <section className="border-t border-rule bg-ink">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-2xl italic leading-relaxed text-paper md:text-3xl">
          &ldquo;I stopped comparing myself to toppers on YouTube and started comparing myself to my own last test.&rdquo;
        </p>
        <p className="mt-6 text-sm text-paper/60">Ananya Sharma — NEET aspirant, Lucknow</p>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
          Your next test is closer than you think.
        </h2>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          Create your free account
        </Link>
      </div>
    </section>
  );
}
