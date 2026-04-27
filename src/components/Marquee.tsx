
export default function Marquee() {
  const keywords = [
    "Hand-Stirred", "Small Batch", "Pure Ingredients", 
    "Hickory Wooden Paddle", "No Machines", "Gourmet Flavors"
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {[...keywords, ...keywords].map((word, i) => (
          <span key={i} className={`marquee-text ${i % 2 === 0 ? 'marquee-text-active' : ''}`}>
            {word} • 
          </span>
        ))}
      </div>
    </div>
  );
}
