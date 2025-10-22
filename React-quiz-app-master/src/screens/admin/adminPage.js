import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './adminPage.css';
import StudentList from '../components/StudentList';
import DateSelector from '../components/DateSelector';
import { compareAttendanceAndQuiz, getStatistics } from '../utils/comparisonUtils';
import googleSheetsService from '../../services/googleSheetsService';

export default class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: '',
            availableDates: [],
            students: [],
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

    // 컴포넌트 마운트 시 사용 가능한 날짜 가져오기
    componentDidMount() {
        this.loadAvailableDates();
    }

    // 사용 가능한 날짜 로드
    loadAvailableDates = async () => {
        try {
            const dates = await googleSheetsService.getAvailableDates();
            this.setState({ availableDates: dates });
        } catch (error) {
            console.error('사용 가능한 날짜 로드 실패:', error);
            // 기본값 설정
            this.setState({ 
                availableDates: ['2025-10-17', '2025-10-21', '2025-10-24'],
                error: '날짜 목록을 불러올 수 없습니다. 기본 날짜를 사용합니다.'
            });
        }
    };

    // 날짜 변경 핸들러
    handleDateChange = (date) => {
        this.setState({ selectedDate: date });
        if (date) {
            this.loadStudentData(date);
        }
    };

    // 학생 데이터 로드 (실제 Google Sheets 데이터)
    loadStudentData = async (date) => {
        this.setState({ loading: true, error: null });
        
        try {
            // Google Sheets에서 실제 데이터 가져오기
            const [attendanceData, quizResponses] = await Promise.all([
                googleSheetsService.getAttendanceData(date),
                googleSheetsService.getQuizResponses(date)
            ]);
            
            console.log('출석부 데이터:', attendanceData);
            console.log('퀴즈 응답 데이터:', quizResponses);
            
            // 출석부와 퀴즈 응답 매칭
            const matchedResults = compareAttendanceAndQuiz(attendanceData, quizResponses);
            
            // 통계 계산
            const statistics = getStatistics(matchedResults);
            
            this.setState({
                students: matchedResults,
                statistics: statistics,
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


    // 학생 체크박스 토글
    handleStudentToggle = (studentId, checked) => {
        this.setState(prevState => ({
            students: prevState.students.map(student => 
                student.student.id === studentId 
                    ? { ...student, checked: checked }
                    : student
            )
        }));
    };

    render() {
        const { selectedDate, students, statistics, loading, error } = this.state;
        const { backToDashboard } = this.props;

        return (
            <div className="table-container">
                <div className="top-banner">
                    <div className="d-flex justify-content-between align-items-center" style={{ padding: '20px', height: '100%' }}>
                        <button 
                            className="btn btn-light"
                            onClick={backToDashboard}
                        >
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
                                <h3>{statistics.respondedStudents}명</h3>
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
                                onStudentToggle={this.handleStudentToggle}
                            />
                        </div>
                    </div>
                )}

                {/* 데이터가 없을 때 */}
                {selectedDate && !loading && !error && students.length === 0 && (
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-info" role="alert">
                                선택한 날짜에 출석한 학생이 없습니다.
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        );
    }
}
