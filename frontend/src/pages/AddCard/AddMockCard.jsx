import { useEffect, useMemo, useState } from "react";
import { onlyDigits, validate } from "./Digits";
import useMockCard from "../../hooks/useMockCard";
import useLocalShare from "../../hooks/useLocalShare";
import ShareTransactionsModal from "./ShareTransactionsModal";
import "./AddMockCard.css";

function AddMockCard() {
  const [cards, setCards] = useState([]);
  const [fullName, setFullName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvc, setCvc] = useState("");
  const [expiryMonth, setExpiryMonth] = useState(12);
  const [expiryYear, setExpiryYear] = useState(2030);

  const { createCard, card } = useMockCard();
  const localShare = useLocalShare();

  const [isBack, setIsBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [shareModalShownOnce, setShareModalShownOnce] = useState(() => {
    return localStorage.getItem("mw_share_modal_shown_once") === "1";
  });

  useEffect(() => {
    if (card) setCards([card]);
    else setCards([]);
  }, [card]);

  const formattedCardNumber = useMemo(() => {
    const digits = onlyDigits(cardNumber).slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(" ") || "#### #### #### ####";
  }, [cardNumber]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      fullName: fullName.trim(),
      cardNumber: onlyDigits(cardNumber).slice(0, 16),
      cvc,
      expiryMonth: Number(expiryMonth),
      expiryYear: Number(expiryYear),
    };

    const msg = validate(payload);
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await createCard(payload);

      if (res?.ok) {
        setFullName("");
        setCardNumber("");
        setCvc("");
        setIsBack(false);

        if (!shareModalShownOnce) {
          setShareError(null);
          setShareModalOpen(true);
          setShareModalShownOnce(true);
          localStorage.setItem("mw_share_modal_shown_once", "1");
        }
      } else {
        setError(res?.message || "Error creating card");
      }
    } catch {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmShare() {
    try {
      setShareLoading(true);
      setShareError(null);

      await localShare.shareLocalTransactions();

      setShareModalOpen(false);
    } catch (e) {
      setShareError(e?.message || "Failed to share transactions");
    } finally {
      setShareLoading(false);
    }
  }

  return (
    <div className="main-wrapper">
      <section className="cards-display-area">
        <h3 className="section-title">My Wallets</h3>

        {cards.length > 0 ? (
          <>
            <div className="horizontal-scroll-container">
              {cards.map((card, index) => (
                <div key={index} className="saved-card-item">
                  <div className="mini-chip" />
                  <div className="mini-number">
                    {card.cardNumberMasked ||
                      "**** " + String(card.cardNumber || "").slice(-4)}
                  </div>
                  <div className="mini-info">
                    <span>{card.fullName}</span>
                    <span>
                      {card.expiryMonth}/{card.expiryYear}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setShareModalOpen(true)}>
                Share Transactions
              </button>
            </div>
          </>
        ) : (
          <div className="empty-placeholder">
            <p>No cards yet. Add your first card below.</p>
          </div>
        )}
      </section>

      <div className="divider" />

      <section className="add-card-grid">
        <div className="card-visual-preview">
          <div className={`card3d-container ${isBack ? "is-flipped" : ""}`}>
            <div className="face face-front">
              <div className="card-header">
                <div className="emv-chip" />
                <div className="card-brand">VISA</div>
              </div>

              <div className="card-number-text">{formattedCardNumber}</div>

              <div className="card-footer">
                <div className="footer-col">
                  <span className="label">Card Holder</span>
                  <span className="val">{fullName || "YOUR NAME"}</span>
                </div>
                <div className="footer-col">
                  <span className="label">Expires</span>
                  <span className="val">
                    {expiryMonth}/{String(expiryYear).slice(-2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="face face-back">
              <div className="black-stripe" />
              <div className="cvc-display">
                <span className="label">CVC</span>
                <div className="white-bar">
                  {cvc.replace(/./g, "*") || "***"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form className="card-input-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="input-group">
            <label>Card Number</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength="16"
              placeholder="0000 0000 0000 0000"
            />
          </div>

          <div className="form-row-triple">
            <div className="input-group">
              <label>CVC</label>
              <input
                onFocus={() => setIsBack(true)}
                onBlur={() => setIsBack(false)}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                maxLength="4"
                placeholder="123"
              />
            </div>

            <div className="input-group">
              <label>Month</label>
              <input
                type="number"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                min="1"
                max="12"
              />
            </div>

            <div className="input-group">
              <label>Year</label>
              <input
                type="number"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                min="2024"
              />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="submit-action-btn" disabled={loading}>
            {loading ? "Adding..." : "Add New Card"}
          </button>
        </form>
      </section>

      <ShareTransactionsModal
        open={shareModalOpen}
        loading={shareLoading}
        error={shareError}
        onClose={() => setShareModalOpen(false)}
        onConfirm={handleConfirmShare}
      />
    </div>
  );
}

export default AddMockCard;