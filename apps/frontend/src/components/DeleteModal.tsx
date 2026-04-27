interface DeleteModalProps {
  concertName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({
  concertName,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">
          <span style={{ fontSize: "1.25rem" }}>✕</span>
        </div>
        <p className="modal-title">
          Are you sure to delete?
          <br />
          &quot;{concertName}&quot;
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-red" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
