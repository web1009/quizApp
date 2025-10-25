import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './adminPage.css';
import StudentList from '../components/StudentList';
import DateSelector from '../components/DateSelector';
import googleSheetsService from '../../services/googleSheetsService';
import { compareAttendanceAndQuiz, getStatistics } from '../utils/comparisonUtils';

export default class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: '',
      availableDates: [],
      students: [],             // 출석부 + 매치된 퀴즈
      unmatchedResponses: [],   // 출석부에 없는 퀴즈 응답
      showUnmatched: false,     // 버튼 클릭 시 표시 여부
      statistics: {
        totalStudents: 0,
        respondedStudents: 0,
        notRespondedStudents: 0,
        responseRate: 0
      },
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.loadAvailableDates();
  }

  loadAvailableDates = async () => {
    try {
      const dates = await googleSheetsService.getAvailableDates();
      this.setState({ availableDates: dates });
    } catch (error) {
      console.error('사용 가능한 날짜 로드 실패:', error);
      this.setState({
        availableDates: ['2025-10-17', '2025-10-21', '2025-10-24'],
        error: '날짜 목록을 불러올 수 없습니다. 기본 날짜를 사용합니다.'
      });
    }
  };

  handleDateChange = (date) => {
    this.setState({ selectedDate: date, showUnmatched: false });
    if (date) {
      this.loadStudentData(date);
    }
  };

  loadStudentData = async (date) => {
    this.setState({ loading: true, error: null });
    try {
      const [attendanceData, quizResponses] = await Promise.all([
        googleSheetsService.getAttendanceData(date),
        googleSheetsService.getQuizResponses(date)
      ]);

      console.log('출석부 데이터:', attendanceData);
      console.log('퀴즈 응답 데이터:', quizResponses);

      // 출석부 학생과 매치된 결과
      const { results: matchedResults, usedResponseIndices } = compareAttendanceAndQuiz(attendanceData, quizResponses);

      // unmatchedQuizResponses = 사용되지 않은 퀴즈 응답들
      const unmatchedQuizResponses = quizResponses.filter((q, index) => !usedResponseIndices.has(index));

      console.log('매치된 퀴즈 응답 수:', usedResponseIndices.size);
      console.log('매치되지 않은 퀴즈 응답 수:', unmatchedQuizResponses.length);
      console.log('전체 퀴즈 응답 수:', quizResponses.length);
      console.log('합계:', usedResponseIndices.size + unmatchedQuizResponses.length);

      // 퀴즈 응답시트 전체 인원 수 (퀴즈 응답 데이터 전체)
      const totalQuizResponses = quizResponses.length;
      
      // totalQuizResponses를 기준으로 통계 계산
      const statistics = getStatistics(matchedResults, totalQuizResponses);
      statistics.totalQuizResponses = totalQuizResponses;

      this.setState({
        students: matchedResults,
        unmatchedResponses: unmatchedQuizResponses,
        statistics,
        loading: false
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      this.setState({
        error: `데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`,
        loading: false
      });
    }
  };

  handleStudentToggle = (studentId, checked) => {
    this.setState(prevState => ({
      students: prevState.students.map(student =>
        student.student.id === studentId
          ? { ...student, checked: checked }
          : student
      )
    }));
  };

  toggleUnmatched = () => {
    this.setState(prevState => ({ showUnmatched: !prevState.showUnmatched }));
  };

  render() {
    const { selectedDate, students, unmatchedResponses, showUnmatched, statistics, loading, error } = this.state;
    const { backToDashboard } = this.props;

    return (
      <div className="table-container">
        <div className="top-banner">
          <div className="d-flex justify-content-between align-items-center" style={{ padding: '20px', height: '100%' }}>
            <button className="btn btn-light" onClick={backToDashboard}>
              ← 대시보드로 돌아가기
            </button>
          </div>
        </div>

        <div className="admin-page">
          {/* 통계 카드 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white stats-card">
                <div className="card-body">
                  <h5 className="card-title">총 출석</h5>
                  <h3>{statistics.totalStudents}명</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white stats-card">
                <div className="card-body">
                  <h5 className="card-title">퀴즈 응답</h5>
                  <h3>{statistics.respondedStudents}명 {statistics.totalQuizResponses && `(총${statistics.totalQuizResponses}명)`}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white stats-card">
                <div className="card-body">
                  <h5 className="card-title">미응답</h5>
                  <h3>{statistics.notRespondedStudents}명</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white stats-card">
                <div className="card-body">
                  <h5 className="card-title">응답률</h5>
                  <h3>{statistics.responseRate}%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className="row mb-4">
            <div className="col-12">
              <DateSelector
                selectedDate={selectedDate}
                availableDates={this.state.availableDates}
                onDateChange={this.handleDateChange}
              />
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="row">
              <div className="col-12 text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">데이터를 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* 학생 목록 */}
          {selectedDate && !loading && !error && (
            <div className="row">
              <div className="col-12">
                <StudentList
                  students={students}
                  date={selectedDate}
                  unmatchedResponses={unmatchedResponses}
                  showUnmatched={showUnmatched}
                  onToggleUnmatched={this.toggleUnmatched}
                  onStudentToggle={this.handleStudentToggle}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
