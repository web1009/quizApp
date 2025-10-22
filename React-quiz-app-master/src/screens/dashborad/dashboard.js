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
    const { list, adminPage } = this.props;
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
              <th>Fecha</th>
              <th>Sesión</th>
              <th>Empezar</th>
              <th>Revisar</th>
            </tr>
          </thead>
          <tbody>
            {list.map((quiz, index) => (
              <tr key={index}>
                <td>{quiz.date}</td>
                <td>{quiz.name}</td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => window.open(quiz.formUrl, "_blank")}
                  >
                    Empezar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => this.openModal(quiz.answer)}
                  >
                    Revisar
                  </button>
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



