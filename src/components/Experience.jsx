import "./Experience.css";

function Experience() {
  return (
    <section className="experience">

      <div className="experience-heading">
        <p className="experience-eyebrow">
          THE QAVERIN EXPERIENCE
        </p>

        <h2>
          More than a fragrance.
          <br />
          <em>A signature.</em>
        </h2>

        <p className="experience-intro">
          Every detail is thoughtfully created to make
          your fragrance experience unforgettable.
        </p>
      </div>


      <div className="experience-grid">

        {/* CARD 01 */}
        <div className="experience-card">

          <div className="experience-icon">
            ✦
          </div>

          <span className="experience-number">
            01
          </span>

          <h3>
            LONG
            <br />
            LASTING
          </h3>

          <p>
            Fragrance that stays with you
            long after the moment.
          </p>

        </div>


        {/* CARD 02 */}
        <div className="experience-card">

          <div className="experience-icon">
            ◇
          </div>

          <span className="experience-number">
            02
          </span>

          <h3>
            PREMIUM
            <br />
            QUALITY
          </h3>

          <p>
            Carefully selected ingredients
            blended with precision.
          </p>

        </div>


        {/* CARD 03 */}
        <div className="experience-card">

          <div className="experience-icon">
            ○
          </div>

          <span className="experience-number">
            03
          </span>

          <h3>
            TIMELESS
            <br />
            ELEGANCE
          </h3>

          <p>
            A refined design created to
            become your signature.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Experience;