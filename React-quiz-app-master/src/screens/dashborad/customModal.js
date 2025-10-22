import React from 'react';
import './customModal.css'; 

export default function CustomModal({ show, content, onClose }) {
  if (!show) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1050
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '600px', width: '100%', borderRadius: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h5 className="modal-title">Revisar</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body" style={{ whiteSpace: 'pre-line' }}>
          {content}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
