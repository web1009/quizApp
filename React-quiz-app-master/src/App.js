import React, { Component } from 'react';
import './App.css';
import Login from './screens/login/login';
import Register from './screens/register/register';
import Dashborad from './screens/dashborad/dashboard';
import AdminPage from './screens/admin/adminPage';
import logo from './logo.png';


class App extends Component {
  constructor(props) {
    super(props);

    // 로컬스토리지에서 로그인 상태와 현재 페이지 가져오기
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedPage = localStorage.getItem('currentPage') || 'login';

    this.state = {
      user: isLoggedIn,      // 로그인 상태
      login: !isLoggedIn && savedPage === 'login',
      register: !isLoggedIn && savedPage === 'register',
      admin: false,          // 관리자 페이지 상태
      quizzes: [
        {
          date: '2025-10-16', name: '1', formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfWfVNwuB_nnrdzB9NKp5mTFFuL_1Yoon-N-4r4o_nD3fUG1w/viewform',
          answer: 
          // `Página en preparación`
          `⭐️ 10/16 Tema de la lección y pregunta de reflexión

          📘 Tema de la lección: Un Corazón Puro 
          📜 Versículos de referencia: Sal86:11

          ✏️ Pregunta para reflexionar : 
          1. ¿Como puedo tener un corazón puro?

          2. ¿Por qué es importante delante de Dios tener un corazón puro?

          3. ¿Como puedo llegar al cielo, según la clase vista?

          4. ¿Como un creyente puede ver a Dios?

          ✅ Respuesta sugerida :
          1. Al guardar la palabra de Dios 

          2. Para poder hacer la voluntad de Dios.

          3. Corazón puro --> voluntad de Dios --> reino de los cielos 

          4. Mt5:8 Corazón limpió al guardar la palabra.`
        },
        {
          date: '2025-10-20', name: '2', formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeam56vTDtPclMUPx-3heHiO0dzJqGPIFuv48KTGaywesBZ7A/viewform',
          answer: `Página en preparación`
// `⭐️ Tema de la lección y pregunta de reflexión

// 📆 Fecha : 25.10.20
// 📘 Tema de la lección: Una Mente Puesta en las Cosas de Arriba 
// 📜 Versículos de referencia: Col3:2

// ✏️ Pregunta para reflexionar : 
// 1. ¿Qué es lo que Dios desea que elijamos?

// 2. ¿Qué son las cosas de Arriba y las cosas de abajo?

// 3. ¿Que es una mente pecaminosa y una mente del espíritu?

// 4. ¿Como puedo recibir vida?

// ✅ Respuesta sugerida :
// 1. Dt30:19-20 la vida y la bendición 

// 2. • Arriba: Cielo --> Dios 
// • Abajo: Tierra --> muerte

// 3. • Mente pecaminosa: dedicada solo a las cosas de la carne.
// • Mente en el espíritu: puesta en las cosas de Dios y el cielo.

// 4. Jn6:63 por medio de la palabra.`
        }

      ],
      pageStack: [savedPage]
    };

    // 바인딩
    this.navabar = this.navabar.bind(this);
    this.registerPage = this.registerPage.bind(this);
    this.loginPage = this.loginPage.bind(this);
    this.dashboradPage = this.dashboradPage.bind(this);
    this.adminPage = this.adminPage.bind(this);
    this.backToDashboard = this.backToDashboard.bind(this);
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
 registerPage() {
  localStorage.setItem('currentPage', 'register');
  this.setState({ login: false, register: true, user: false, pageStack: ['register'] });
}

loginPage() {
  localStorage.setItem('currentPage', 'login');
  this.setState({ login: true, register: false, user: false, pageStack: ['login'] });
}

dashboradPage() {
  localStorage.setItem('currentPage', 'dashboard');
  this.setState({ login: false, register: false, user: true, admin: false, pageStack: ['dashboard'] });
}

// 관리자 페이지 함수
adminPage() {
  const password = prompt('관리자 비밀번호를 입력하세요:');
  if (password === 'scj0314') {
    localStorage.setItem('currentPage', 'admin');
    this.setState({ login: false, register: false, user: false, admin: true, pageStack: ['admin'] });
  } else if (password !== null) {
    alert('비밀번호가 올바르지 않습니다.');
  }
}

// 대시보드로 돌아가기
backToDashboard() {
  localStorage.setItem('currentPage', 'dashboard');
  this.setState({ login: false, register: false, user: true, admin: false, pageStack: ['dashboard'] });
}

render() {
  const { user, login, register, admin, quizzes } = this.state;

  return (
    <div className="App">
      <this.navabar />
      <br />

      {!user && !admin && login && <Login registerPage={this.registerPage} dashboardPage={this.dashboradPage} />}
      {!user && !admin && register && <Register loginPage={this.loginPage} />}
      {user && !admin && <Dashborad list={quizzes} adminPage={this.adminPage} />}
      {admin && <AdminPage backToDashboard={this.backToDashboard} />}
    </div>
  );
}
}

export default App;


