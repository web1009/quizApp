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
          date: '2025-10-23', 
          name: '1', 
          formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdwIxObz_GPzMQAAEii4Ocqmy4Y03b4Teii4tf_W9oF_avD1Q/viewform',
          answer: 
          // `Página en preparación`
`⭐️ Tema de la lección y pregunta de reflexión

📆 Fecha : 25.10.23
📘 Tema de la lección: Una Fe Sincera 
📜 Versículos de referencia: 1 Tim 1:5

✏️ Pregunta para reflexionar : 
1. ¿Que debe tener una fe reconocida por Dios?

2. ¿Con qué tipo de corazón acercase a Dios? Escriba versos de referencias.

3. ¿Que es lo Dios pesa en los creyentes?

4. ¿Por es importante tener una fe sincera?

✅ Respuesta sugerida :
1. Acciones de acuerdo al conocimiento correcto de Dios.

2. Corazón limpio y sincero (1 Tim 1:5, He 10:22)

3. Los espíritus, los corazones si tienen la palabra de Dios. (Pr16:2)

4. La fe verdadera nos lleva al cielo (Jn6:28-29, Jn14:6)`,
          quizUploaded: true,
          answerUploaded: true
        },
        {
          date: '2025-10-27', 
          name: '2', 
          formUrl: 'https://forms.gle/ys6FgYu7fSdgBNxy9',
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


