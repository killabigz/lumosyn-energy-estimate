const paragraphs = [
  "Lumosyn helps Jamaicans take the first step toward practical, affordable energy solutions.",
  "We exist because energy decisions can feel complicated, expensive, and unclear when people are just starting out.",
  "Our mission is to make guidance simple, respectful, and useful before anyone is asked to make a commitment.",
  "Trust comes first. Transactions should only happen after customers understand their options with confidence.",
];

export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="border-y border-border bg-surface"
      id="about"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="motion-fade-up">
          <h2
            className="text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-4xl"
            id="about-heading"
          >
            About Lumosyn
          </h2>
        </div>
        <div className="motion-fade-up motion-delay-1 grid gap-5 text-base leading-7 text-muted sm:text-lg">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
