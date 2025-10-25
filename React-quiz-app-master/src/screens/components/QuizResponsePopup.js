import React, { useState } from 'react';
import './QuizResponsePopup.css';

const QuizResponsePopup = ({ isOpen, onClose, quizData }) => {
  const [translatedAnswers, setTranslatedAnswers] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !quizData) return null;

  const { studentName, responseTime, answers } = quizData;

  const translateText = async (text) => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (err) {
      console.error('번역 실패:', err);
      return '(번역 실패)';
    }
  };

  const handleTranslate = async () => {
    if (!answers || answers.length === 0) return;
    setLoading(true);
    const results = [];
    for (const ans of answers) {
      const tr = await translateText(ans || '');
      results.push(tr);
    }
    setTranslatedAnswers(results);
    setLoading(false);
  };

  const handleClose = () => {
    setTranslatedAnswers(null);
    setLoading(false);
    onClose && onClose();
  };

  const displayAnswers = translatedAnswers || answers;

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>퀴즈 응답 내용</h3>
          <button className="close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="popup-body">
          <div className="student-info">
            <div className="info-item">
              <span className="label">학생명:</span>
              <span className="value">{studentName}</span>
            </div>
            <div className="info-item">
              <span className="value">{responseTime}</span>
            </div>
          </div>

          <div className="answers-section">
            {answers && answers.length > 0 ? (
              <>
                <div className="translate-button-container">
                  <button onClick={handleTranslate} disabled={loading}>
                    {loading ? '시간이 소요될 수 있으니 잠시만 기다려주세요!..' : '한국어 번역'}
                  </button>
                  {translatedAnswers && (
                    <button onClick={() => setTranslatedAnswers(null)} className="show-original-button">
                      원문 보기
                    </button>
                  )}
                </div>

                <table className="answers-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>응답 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAnswers.map((answer, index) => (
                      <tr key={index}>
                        <td>Q{index + 1}</td>
                        <td>{answer || '(응답 없음)'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
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
