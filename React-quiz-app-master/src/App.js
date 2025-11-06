import React, { Component } from 'react';
import './App.css';
import Dashborad from './screens/dashborad/dashboard';
import AdminPage from './screens/admin/adminPage';
import logo from './logo.png';


class App extends Component {
  constructor(props) {
    super(props);

    // 캐시 방지 설정
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }

    // 로컬스토리지에서 현재 페이지 가져오기
    const savedPage = localStorage.getItem('currentPage') || 'dashboard';

    this.state = {
      user: true,             // 항상 로그인된 상태로 설정
      admin: false,           // 관리자 페이지 상태
      quizzes: [
        {
          date: '2025-11-03', 
          name: '1', 
          formUrl: 'https://forms.gle/x1NqrvGm8rdqU6LQ8',
          answer: 
          // `Página en preparación`
`⭐️ Tema de la lección y pregunta de reflexión

📆 Fecha : 25.11.04
📘 Tema de la lección: Un Creyente Según el Corazón de Dios 
📜 Versículos de referencia: Jr24:7

✏️ Pregunta para reflexionar : 
1. ¿Que creyentes busca Dios, y porque los busca?

2. ¿Por qué el pueblo no pudo reconocer el deseo de salvación para ellos?

3. ¿Que son cosas que debo tener en mi camino de fe como estándar?

4. ¿Que es adorar en espíritu y en verdad?

✅ Respuesta sugerida :
1. Creyentes verdaderos que lo adoran en espíritu y verdad 

2. Porque no tenían conocimiento de Dios (Ro102-3, Mr7:8)

3. A) mucha oración 
    B) mucha lectura de la palabra de Dios.
  C) Conocimiento, fe y acciones ✅
   D) Estándar siempre la palabra.

4. Es guardando la palabra, porque la palabra contiene la voluntad de Dios (Jn6:63)`,
          quizUploaded: true,
          answerUploaded: true
        },
        {
          date: '2025-11-06', 
          name: '2', 
          formUrl: 'https://forms.gle/Yy1msr9XVqDjW5JG6',
          answer: 
          `Página en preparación`,
          quizUploaded: true,
          answerUploaded: false
        }

      ],
      pageStack: [savedPage]
    };

    // 바인딩
    this.navabar = this.navabar.bind(this);
    this.dashboradPage = this.dashboradPage.bind(this);
    this.adminPage = this.adminPage.bind(this);
    this.backToDashboard = this.backToDashboard.bind(this);
    this.toggleQuizUpload = this.toggleQuizUpload.bind(this);
    this.toggleAnswerUpload = this.toggleAnswerUpload.bind(this);
  }

  // Navbar
  navabar() {
    return (
      <nav className="navbar navbar-light bg-light">
        {/* <a className="navbar-brand" href="#"> */}
        <button className="navbar-brand" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' /* 여기에 추가 스타일 */ }}>
          <img src={logo} width="30" height="30" className="d-inline-block align-top" alt="" />
          Quizzes
        </button>
      </nav>
    );
  }

 // 페이지 전환 함수

dashboradPage() {
  localStorage.setItem('currentPage', 'dashboard');
  this.setState({ user: true, admin: false, pageStack: ['dashboard'] });
}

// 관리자 페이지 함수
adminPage() {
  const password = prompt('관리자 비밀번호를 입력하세요:');
  if (password === 'scj0314') {
    localStorage.setItem('currentPage', 'admin');
    this.setState({ user: false, admin: true, pageStack: ['admin'] });
  } else if (password !== null) {
    alert('비밀번호가 올바르지 않습니다.');
  }
}

// 대시보드로 돌아가기
backToDashboard() {
  localStorage.setItem('currentPage', 'dashboard');
  this.setState({ user: true, admin: false, pageStack: ['dashboard'] });
}

// 퀴즈 업로드 상태 토글
toggleQuizUpload(quizIndex) {
  this.setState(prevState => ({
    quizzes: prevState.quizzes.map((quiz, index) => 
      index === quizIndex 
        ? { ...quiz, quizUploaded: !quiz.quizUploaded }
        : quiz
    )
  }));
}

// 답변 업로드 상태 토글
toggleAnswerUpload(quizIndex) {
  this.setState(prevState => ({
    quizzes: prevState.quizzes.map((quiz, index) => 
      index === quizIndex 
        ? { ...quiz, answerUploaded: !quiz.answerUploaded }
        : quiz
    )
  }));
}

render() {
  const { user, admin, quizzes } = this.state;

  return (
    <div className="App">
      <this.navabar />
      <br />

      {user && !admin && <Dashborad 
        list={quizzes} 
        adminPage={this.adminPage}
        toggleQuizUpload={this.toggleQuizUpload}
        toggleAnswerUpload={this.toggleAnswerUpload}
      />}
      {admin && <AdminPage backToDashboard={this.backToDashboard} />}
    </div>
  );
}
}

export default App;


