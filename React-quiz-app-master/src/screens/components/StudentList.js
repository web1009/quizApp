import React, { useState } from 'react';
import './StudentList.css';
import QuizResponsePopup from './QuizResponsePopup';

const StudentList = ({
  students,
  date,
  unmatchedResponses,
  showUnmatched,
  onToggleUnmatched
}) => {
  const [sortOrder, setSortOrder] = useState('name');
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedQuizData, setSelectedQuizData] = useState(null);

  const handleQuizResponseClick = (student) => {
    if (student.quizData) {
      setSelectedQuizData(student.quizData);
      setPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedQuizData(null);
  };

  // 정렬 함수
  const sortByName = (a, b) => (a.student.fullName || '').localeCompare(b.student.fullName || '');
  const sortByResponse = (a, b) => {
    if (a.quizResponded && !b.quizResponded) return -1;
    if (!a.quizResponded && b.quizResponded) return 1;
    return sortByName(a, b);
  };
  const sortByAttendance = (a, b) => {
    const timeA = a.student.attendanceTime || 0;
    const timeB = b.student.attendanceTime || 0;
    return timeB - timeA || sortByName(a, b);
  };

  const getSortedStudents = () => {
    const copy = [...students];
    switch (sortOrder) {
      case 'name': return copy.sort(sortByName);
      case 'response': return copy.sort(sortByResponse);
      case 'attendance': return copy.sort(sortByAttendance);
      default: return copy.sort(sortByName);
    }
  };

  const getStatusIcon = (quizResponded) =>
    quizResponded ? <span className="status-icon check">✓</span> : <span className="status-icon cross">✗</span>;
  const getStatusClass = (quizResponded) =>
    quizResponded ? 'responded' : 'not-responded';

  return (
    <div className="student-list-container">
      <h2 className="date-header">{date} 출석 학생 목록</h2>

      <div className="sort-controls">
        <span className="sort-label">정렬:</span>
        <button className={`sort-button ${sortOrder === 'name' ? 'active' : ''}`} onClick={() => setSortOrder('name')}>이름순</button>
        <button className={`sort-button ${sortOrder === 'response' ? 'active' : ''}`} onClick={() => setSortOrder('response')}>응답순</button>
        <button className={`sort-button ${sortOrder === 'attendance' ? 'active' : ''}`} onClick={() => setSortOrder('attendance')}>출석시간순</button>

        {unmatchedResponses.length > 0 && (
          <button className="sort-button" onClick={onToggleUnmatched}>
            {showUnmatched ? '숨기기' : `매치되지 않은 응답 포함 (${unmatchedResponses.length})`}
          </button>
        )}
      </div>

      {/* 🔹 showUnmatched가 true이면 unmatchedResponses만 표시 */}
      {showUnmatched ? (
        <div className="student-list">
          <h3 className="unmatched-header">매치되지 않은 응답 ({unmatchedResponses.length}명)</h3>
          {unmatchedResponses.map((r, idx) => (
            <div key={idx} className="student-item unmatched-item">
              <div className="student-info">
                <div className="student-id">{r.yCode || 'N/A'}</div>
                <div className="student-name">{r.studentName}</div>
                <div className="attendance-time">응답시간: {r.responseTime}</div>
              </div>
              <div className="student-status">
                <span className="status-icon check">✓</span>
                <span className="status-text">퀴즈 응답 완료 (매치 안됨)</span>
              </div>
              <div className="quiz-button-wrapper">
                <button className="quiz-response-button" onClick={() => {
                  // 매치되지 않은 응답 데이터를 quizData 형태로 변환
                  const quizData = {
                    studentName: r.studentName,
                    responseTime: r.responseTime,
                    answers: r.answers || []
                  };
                  setSelectedQuizData(quizData);
                  setPopupOpen(true);
                }}>
                  📝 응답보기
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="student-list">
          {getSortedStudents().map((student, index) => (
            <div key={`${student.student.id}-${index}`} className={`student-item ${getStatusClass(student.quizResponded)}`}>
              <div className="student-info">
                <div className="student-id">{student.student.id || 'N/A'}</div>
                <div className="student-name">{student.student.fullName}</div>
                {student.student.attendanceTime && <div className="attendance-time">참여시간: {student.student.attendanceTime}분</div>}
              </div>

              <div className="student-status">
                {getStatusIcon(student.quizResponded)}
                <span className="status-text">{student.quizResponded ? '퀴즈 응답 완료' : '퀴즈 미응답'}</span>
              </div>

              {student.quizResponded && student.quizData && (
                <div className="quiz-button-wrapper">
                  <button className="quiz-response-button" onClick={() => handleQuizResponseClick(student)}>
                    📝 응답보기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <QuizResponsePopup isOpen={popupOpen} onClose={handleClosePopup} quizData={selectedQuizData} />
    </div>
  );
};

export default StudentList;
