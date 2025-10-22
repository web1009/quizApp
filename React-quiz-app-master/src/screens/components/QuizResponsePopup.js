import React from 'react';
import './QuizResponsePopup.css';

const QuizResponsePopup = ({ isOpen, onClose, quizData }) => {
  if (!isOpen || !quizData) return null;

  const { studentName, responseTime, answers } = quizData;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>퀴즈 응답 내용</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="popup-body">
          <div className="student-info">
            <div className="info-item">
              <span className="label">학생명:</span>
              <span className="value">{studentName}</span>
            </div>
            <div className="info-item">
              <span className="label">응답시간:</span>
              <span className="value">{responseTime}</span>
            </div>
          </div>

          <div className="answers-section">
            <h4>퀴즈 응답</h4>
            {answers && answers.length > 0 ? (
              <table className="answers-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>응답 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((answer, index) => (
                    <tr key={index}>
                      <td>Q{index + 1}</td>
                      <td>{answer || '(응답 없음)'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-answers">퀴즈 응답이 없습니다.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizResponsePopup;
