import { useEffect, useRef } from 'react';

// A native modal dialog: focus is trapped inside, Escape closes it,
// and focus returns to the control that opened it.
export default function Sheet({ open, onClose, variant, labelledBy, children }) {
  const ref = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // The dialog also fires "close" when we shut it ourselves (for example the
  // list making way for a robot's page). Only report closes the visitor asked for.
  const handleClose = () => {
    if (openRef.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`sheet sheet--${variant}`}
      aria-labelledby={labelledBy}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open ? <div className="sheet-body">{children}</div> : null}
    </dialog>
  );
}
