const paragraphs = [
  "Every blackout reminds us how important reliable energy is.",
  "Too many people feel overwhelmed by technical terms, conflicting advice, and expensive systems.",
  "We believe understanding your energy options should be simple.",
  "We're documenting the journey, building practical tools, and sharing what we learn to help more Jamaicans make confident energy decisions.",
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
            Why Lumosyn Exists
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
