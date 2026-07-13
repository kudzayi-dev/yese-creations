import { IconArrow, IconInstagram, IconPinterest, IconTiktok } from "./icons";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.news}>
        <div>
          <h2 className={styles.newsHeading}>
            Join the <span className={styles.script}>stitch club</span>
          </h2>
          <p className={styles.newsText}>
            One email a month from me — new pieces, a peek at what's on my desk, studio sales,
            and an occasional 10% off code. No spam, ever. Just me.
          </p>
        </div>
        <div className={styles.signupWrap}>
          <div className={styles.signup}>
            <input type="email" placeholder="your@email.com" />
            <button className="btn btn-gold">
              Join <IconArrow size={14} />
            </button>
          </div>
          <div className={styles.signupNote}>By joining you agree to occasional warm hellos.</div>
        </div>
      </div>

      <div className={styles.cols}>
        <div className={styles.brand}>
          <img src="/assets/yese-logo-cutout.png" alt="" />
          <div>
            <div className={styles.brandName}>Yese Creations</div>
            <div className={styles.brandTag}>a studio of one</div>
            <p className={styles.desc}>
              An independent artist crocheting, painting and hand-making colourful keepsakes —
              slowly, from one small London studio.
            </p>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="#shop">Bouquets</a></li>
            <li><a href="#shop">Plushies</a></li>
            <li><a href="#gallery">Original paintings</a></li>
            <li><a href="#shop">Prints</a></li>
            <li><a href="#shop">Home &amp; accessories</a></li>
            <li><a href="#">Gift cards</a></li>
          </ul>
        </div>
        <div>
          <h4>Studio</h4>
          <ul>
            <li><a href="#">Our story</a></li>
            <li><a href="#">Bespoke service</a></li>
            <li><a href="#">Care guide</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>

        <div>
          <h4>Hello</h4>
          <ul>
            <li><a href="mailto:hello@yese.studio">hello@yese.studio</a></li>
            <li><a href="#" className={styles.social}><IconInstagram size={14} /> @yese.creations</a></li>
            <li><a href="#" className={styles.social}><IconPinterest size={14} /> yesecreations</a></li>
            <li><a href="#" className={styles.social}><IconTiktok size={14} /> yesemakes</a></li>
            <li><a href="#">Visit the studio</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div>© 2026 Yese Creations · run, made &amp; loved by Yese in London</div>
        <div className={styles.bottomLinks}>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
