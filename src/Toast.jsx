import { useCart } from "./CartContext.jsx";

function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="flowra-toast" role="status" aria-live="polite">
      <span className="toast-icon">✨</span>
      <span className="toast-text">{toastMessage}</span>
    </div>
  );
}

export default Toast;
