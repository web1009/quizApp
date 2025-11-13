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
          date: '2025-11-10', 
          name: '1', 
          formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeuCjdXMKq9v3O5dV6xHdVN_ksFPYM4HzkhtJAr3YxAQR6iVA/viewform',
          answer: 
          // `Página en preparación`
`⭐️ Tema de la lección y pregunta de reflexión

📆 Fecha : 25.11.10
📘 Tema de la lección : Como se conecta la biblia a través de una promesa
📜 Versículos de referencia : Sal 25:10

✏️ Pregunta para reflexionar : 

1. ¿Cuáles son los 4 componentes de la promesa de Dios?

2. ¿Qué fue lo que el Antiguo Testamento prometía principalmente al pueblo de Israel? (Mencione un versículo).

3. ¿Qué debo hacer para guardar el Nuevo pacto?

✅ Respuesta sugerida :

1. 
1)Promesa entre Dios y el pueblo. 
2) Confirmado con sangre.
3) Si se guarda el pacto, Dios da bendiciones. 
4) Tiene que saber el pacto para guardarlo.

2. La llegada del redentor (la primera venida de Jesús), Isa 59:20, Jn 1:45.

3. Debo conocer las profecías del Nuevo Testamento.`,
          quizUploaded: true,
          answerUploaded: true
        },
        {
          date: '2025-11-13', 
          name: '2', 
          formUrl: 'https://forms.gle/8k5FVmVvJL1cJL1QA',
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


