import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTrueLayer from "../../hooks/useTrueLayer";
import "./TrueLayer.css";

function TrueLayer({ buttonClassName = "", autoOpen = false, onClose }) {
  const [open, setOpen] = useState(autoOpen);
  const [authUrl, setAuthUrl] = useState("");

  const navigate = useNavigate();
  const { startAuth, loading, error } = useTrueLayer();

  async function handleOpen() {
    try {
      const data = await startAuth();
      setAuthUrl(data.authUrl);
      setOpen(true);
    } catch (e) {
      console.log("error", e);
    }
  }

  async function openModalDirectly() {
    try {
      const data = await startAuth();
      setAuthUrl(data.authUrl);
      setOpen(true);
    } catch (e) {
      console.log("error", e);
    }
  }

  function close() {
    setOpen(false);
    setAuthUrl("");
    if (onClose) onClose();
  }

  function handleRedirect() {
    if (authUrl) {
      window.location.href = authUrl;
    }
  }

  // إذا كان autoOpen=true افتح مباشرة
  useState(() => {
    if (autoOpen) {
      openModalDirectly();
    }
  }, []);

  return (
    <>
      {!autoOpen && (
        <button
          type="button"
          className={buttonClassName}
          onClick={handleOpen}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Continue with TrueLayer"}
        </button>
      )}

      {open && (
        <div className="tl-modal-overlay" onClick={close}>
          <div className="tl-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tl-modal-header">
              <h3>Connect your bank</h3>
              <button className="tl-close" onClick={close} type="button">
                ×
              </button>
            </div>

            <p className="tl-text">Scan QR with your mobile:</p>

            <div className="tl-qr">
              {authUrl && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(authUrl)}`}
                  alt="QR Code"
                  width={180}
                  height={180}
                />
              )}
            </div>

            <p className="tl-text">Or open this link:</p>

            <button
              className="tl-link-btn"
              onClick={handleRedirect}
              type="button"
              disabled={!authUrl}
            >
              Open TrueLayer
            </button>

            <button
              className="tl-link-btn"
              type="button"
              onClick={() => {
                close();
                navigate("/dashboard");
              }}
            >
              Cancel
            </button>

            {error && <div className="tl-error">{String(error?.message || error)}</div>}
          </div>
        </div>
      )}
    </>
  );
}

export default TrueLayer;