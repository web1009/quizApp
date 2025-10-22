import React, { Component } from 'react';
import swal from 'sweetalert';

class Login extends Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            email: '',
            password: '',
            isRegisterPage: true // true: 회원가입, false: 로그인
        };

        this.handleChange = this.handleChange.bind(this);
        this.registerUser = this.registerUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.togglePage = this.togglePage.bind(this);
    }

    handleChange(evt) {
        this.setState({ [evt.target.name]: evt.target.value });
    }

    // 회원가입
    registerUser() {

        console.log('registerUser called', this.state);
        const { name, email, password } = this.state;

        if (!name || !email || !password) {
            swal("Oops!", "Please fill in all fields!", "error");
            return;
        }

        const user = { name, email, password };
        localStorage.setItem('user', JSON.stringify(user));
        swal("Congrats!", "Successfully Registered!", "success");

        // Google Sheets 기록
        fetch('https://script.google.com/macros/s/AKfycbyR5pHpCVZ_XXoa5Og4I1lLtVoxvZsiUG78ws_jsBkXeUZzkMUuCXpugGOqsPDCWQR3dg/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                name: user.name,
                score: 0
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "duplicate") {
                    console.log("이미 기록된 계정");
                } else {
                    console.log("회원가입 기록 저장 완료");
                }
            })
            .catch(err => console.error(err));

        this.setState({ isRegisterPage: false }); // 로그인 화면으로 전환
    }

    // 로그인
    loginUser() {
        const { name, password } = this.state;
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser) {
            swal("Oops!", "No registered user. Please register first!", "error");
            return;
        }

        if (storedUser.name === name && storedUser.password === password) {
            swal("Congrats!", "Successfully Logged In!", "success");

            // 로그인 상태를 저장
            localStorage.setItem('isLoggedIn', 'true');

            // 뒤로가기 스택 초기화 (히스토리 덮어쓰기)
            window.history.pushState(null, '', '/dashboard');
            window.onpopstate = function (event) {
                window.history.go(1); // 뒤로가기를 막음
            };

            this.props.dashboardPage(); // 퀴즈 페이지로 이동
        } else {
            swal("Oops!", "Wrong Name or Password!", "error");
        }
    }


    // 페이지 전환 (회원가입 ↔ 로그인)
    togglePage() {
        this.setState({ isRegisterPage: !this.state.isRegisterPage });
    }

    render() {
        const { isRegisterPage } = this.state;

        return (
            <div className="login">
                <div className="row">
                    <div className="col-md-6 mx-auto">
                        <div className="card card-body">
                            <h3 className="text-center">{isRegisterPage ? "Register" : "Login"}</h3>

                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" name="name" className="form-control" onChange={this.handleChange} />
                            </div>

                            {/* 회원가입일 경우에만 이메일 입력 */}
                            {isRegisterPage && (
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" className="form-control" onChange={this.handleChange} />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" className="form-control" onChange={this.handleChange} />
                            </div>

                            <button
                                className="btn btn-primary btn-block"
                                onClick={isRegisterPage ? this.registerUser : this.loginUser}
                            >
                                Submit
                            </button>

                            <hr />

                            <button className="btn btn-link btn-block" onClick={this.togglePage}>
                                {isRegisterPage ? "Already have an account? Login" : "Don't have an account? Register"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;

