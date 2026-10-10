export default function Marquee() {
  const keywords = [
    "Hand-Stirred Daily",
    "Arizona Small Batch",
    "100% Pure Corn Oil",
    "8-Foot Hickory Paddle",
    "No Chemical Preservatives",
    "Gourmet Monster Kernels",
    "50% School Giveback",
  ];

  // Repeat for seamless gapless looping on all monitor resolutions
  const displayItems = [...keywords, ...keywords, ...keywords, ...keywords];

  return (
    <div className="marquee-container" aria-label="Artisanal Craft Highlights">
      <div className="marquee-content">
        {displayItems.map((word, i) => (
          <span
            key={i}
            className={`marquee-text ${i % 2 === 0 ? 'marquee-text-active' : ''}`}
            aria-hidden={i >= keywords.length ? 'true' : undefined}
          >
            {word} <span className="marquee-bullet">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
