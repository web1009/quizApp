// screens/dashboard/dashboard.js
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomModal from './customModal';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalContent: ""
    };
  }

  openModal = (content) => {
    this.setState({ showModal: true, modalContent: content });
  };

  closeModal = () => {
    this.setState({ showModal: false, modalContent: "" });
  };

  render() {
    const { list, adminPage, toggleQuizUpload, toggleAnswerUpload } = this.props;
    const { showModal, modalContent } = this.state;

    return (
      <div className="table-container">
        {/* 1. 관리자 페이지 버튼 맨 위 */}
        <div style={{ textAlign: 'right', padding: '10px' }}>
          <button
            className="btn btn-outline-primary"
            onClick={adminPage}>
            Admin
          </button>
        </div>

        {/* 2. 배너 (back.jpg) */}
        <div className="top-banner"></div>

        {/* 3. 테이블 */}

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Fecha & Sesión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((quiz, index) => (
              <tr key={index}>
                <td className="date-session-cell">
                  <div className="date-info">
                    <strong>{quiz.date}</strong>
                  </div>
                  <div className="session-info">
                    Sesión {quiz.name}
                  </div>
                  <div className="upload-status">
                    <span 
                      className={`status-badge ${quiz.quizUploaded ? 'quiz-uploaded' : 'quiz-not-uploaded'}`}
                      onClick={() => toggleQuizUpload(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {quiz.quizUploaded ? '📝 Quiz Subido' : '📝 Quiz Pendiente'}
                    </span>
                    <span 
                      className={`status-badge ${quiz.answerUploaded ? 'answer-uploaded' : 'answer-not-uploaded'}`}
                      onClick={() => toggleAnswerUpload(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      {quiz.answerUploaded ? '✅ Respuesta Subida' : '⏳ Respuesta Pendiente'}
                    </span>
                  </div>
                </td>
                <td className="button-cell">
                  <div className="button-container">
                    <button
                      className="btn btn-success quiz-button"
                      onClick={() => window.open(quiz.formUrl, "_blank")}
                    >
                      Empezar
                    </button>
                    <button
                      className="btn btn-primary response-button"
                      onClick={() => this.openModal(quiz.answer)}
                    >
                      Revisar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        <CustomModal
          show={showModal}
          content={modalContent}
          onClose={this.closeModal}
        />
      </div>
    );
  }
}



