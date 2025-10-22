import React, { useState } from 'react';
import './StudentList.css';
import QuizResponsePopup from './QuizResponsePopup';

const StudentList = ({ 
  students, 
  date
}) => {
  const [sortOrder, setSortOrder] = useState('name'); // 'name', 'response', 'attendance'
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedQuizData, setSelectedQuizData] = useState(null);
  const [showOnlyNotResponded, setShowOnlyNotResponded] = useState(false);

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

  // 정렬 함수들
  const sortByName = (a, b) => {
    const nameA = a.student.fullName || '';
    const nameB = b.student.fullName || '';
    
    // 영어로 시작하는 이름인지 확인
    const isEnglishA = /^[A-Za-z]/.test(nameA);
    const isEnglishB = /^[A-Za-z]/.test(nameB);
    
    // Y로 시작하는 코드인지 확인
    const isYA = /^Y\d+/.test(nameA);
    const isYB = /^Y\d+/.test(nameB);
    
    // 정렬 우선순위: 영어 -> Y
    if (isEnglishA && !isEnglishB) return -1;
    if (!isEnglishA && isEnglishB) return 1;
    
    if (isYA && !isYB) return -1;
    if (!isYA && isYB) return 1;
    
    // 같은 카테고리 내에서 정렬
    if (isEnglishA && isEnglishB) {
      return nameA.localeCompare(nameB);
    }
    
    if (isYA && isYB) {
      const matchA = nameA.match(/Y(\d+)/);
      const matchB = nameB.match(/Y(\d+)/);
      const numA = parseInt(matchA ? matchA[1] : '0');
      const numB = parseInt(matchB ? matchB[1] : '0');
      return numA - numB;
    }
    
    return nameA.localeCompare(nameB);
  };

  const sortByResponse = (a, b) => {
    // 퀴즈 응답한 학생을 먼저, 그 다음 이름 순
    if (a.quizResponded && !b.quizResponded) return -1;
    if (!a.quizResponded && b.quizResponded) return 1;
    return sortByName(a, b);
  };

  const sortByAttendance = (a, b) => {
    // 출석 시간 순 (긴 시간부터), 그 다음 이름 순
    const timeA = a.student.attendanceTime || 0;
    const timeB = b.student.attendanceTime || 0;
    if (timeA !== timeB) return timeB - timeA;
    return sortByName(a, b);
  };

  // 정렬된 학생 목록
  const getSortedStudents = () => {
    const sorted = [...students];
    switch (sortOrder) {
      case 'name':
        return sorted.sort(sortByName);
      case 'response':
        return sorted.sort(sortByResponse);
      case 'attendance':
        return sorted.sort(sortByAttendance);
      default:
        return sorted.sort(sortByName);
    }
  };

  const sortedStudents = getSortedStudents();

  const getStatusIcon = (quizResponded) => {
    if (quizResponded) {
      return <span className="status-icon check">✓</span>;
    }
    return <span className="status-icon cross">✗</span>;
  };

  const getStatusClass = (quizResponded) => {
    return quizResponded ? 'responded' : 'not-responded';
  };

  // 필터 적용
  const getVisibleStudents = () => {
    if (showOnlyNotResponded) {
      return students.filter(s => !s.quizResponded);
    }
    return students;
  };

  return (
    <div className="student-list-container">
      <h2 className="date-header">{date} 출석 학생 목록</h2>
      <div className="stats">
        <span className="stat-item">
          총 출석: <strong>{students.length}</strong>명
        </span>
        <span className="stat-item">
          퀴즈 응답: <strong>{students.filter(s => s.quizResponded).length}</strong>명
        </span>
        <span className="stat-item">
          응답률: <strong>{Math.round((students.filter(s => s.quizResponded).length / students.length) * 100)}%</strong>
        </span>
      </div>
      
      <div className="sort-controls">
        <span className="sort-label">정렬:</span>
        <button 
          className={`sort-button ${sortOrder === 'name' ? 'active' : ''}`}
          onClick={() => setSortOrder('name')}
        >
          이름순 (영어→Y→M)
        </button>
        <button 
          className={`sort-button ${sortOrder === 'response' ? 'active' : ''}`}
          onClick={() => setSortOrder('response')}
        >
          응답순
        </button>
        <button 
          className={`sort-button ${sortOrder === 'attendance' ? 'active' : ''}`}
          onClick={() => setSortOrder('attendance')}
        >
          출석시간순
        </button>
        <button 
          className={`sort-button ${showOnlyNotResponded ? 'active' : ''}`}
          onClick={() => setShowOnlyNotResponded(prev => !prev)}
        >
          미응답만 보기
        </button>
      </div>
      
      <div className="student-list">
        {(() => {
          const visible = getVisibleStudents();
          const sorted = (() => {
            const copy = [...visible];
            switch (sortOrder) {
              case 'name':
                return copy.sort(sortByName);
              case 'response':
                return copy.sort(sortByResponse);
              case 'attendance':
                return copy.sort(sortByAttendance);
              default:
                return copy.sort(sortByName);
            }
          })();
          return sorted;
        })().map((student, index) => (
          <div 
            key={`${student.student.id}-${student.student.fullName}-${index}`} 
            className={`student-item ${getStatusClass(student.quizResponded)}`}
          >
            <div className="student-info">
              <div className="student-id">{student.student.id || 'N/A'}</div>
              <div className="student-name">{student.student.fullName}</div>
              {student.student.attendanceTime && (
                <div className="attendance-time">
                  참여시간: {student.student.attendanceTime}분
                </div>
              )}
            </div>
            
            <div className="student-status">
              {getStatusIcon(student.quizResponded)}
              <span className="status-text">
                {student.quizResponded ? '퀴즈 응답 완료' : '퀴즈 미응답'}
              </span>
            </div>

            <div className="student-actions">
              {student.quizResponded && student.quizData && (
                <button 
                  className="quiz-response-button"
                  onClick={() => handleQuizResponseClick(student)}
                  title="퀴즈 응답 보기"
                >
                  📝 응답보기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="no-data">
          <p>해당 날짜에 출석한 학생이 없습니다.</p>
        </div>
      )}

      <QuizResponsePopup
        isOpen={popupOpen}
        onClose={handleClosePopup}
        quizData={selectedQuizData}
      />
    </div>
  );
};

export default StudentList;
