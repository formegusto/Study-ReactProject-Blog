import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForm from '../../components/auth/AuthForm';
import { changeField, initalizeForm, register } from '../../modules/auth';
import { check } from '../../modules/user';
import { withRouter } from 'react-router-dom';

const RegisterForm = ({ history }) => {
    const [error,setError] = useState(null);
    const dispatch = useDispatch();
    const { form, auth, authError, user } = useSelector(({auth, user}) => ({
        form: auth.register,
        auth: auth.auth,
        authError: auth.authError,
        user: user.user,
    }));

    const onChange = e => {
        const { value, name } = e.target;
        dispatch(
            changeField({
                form:'register',
                key: name,
                value
            })
        );
    };

    const onSubmit = e => {
        e.preventDefault();
        const { username, password, passwordConfirm } = form;
        // 1. 하나라도 비어있을 때
        if([username, password, passwordConfirm].includes('')){
            setError('빈 칸을 모두 입력하세요.');
            return;
        }

        // 2. 비밀번호가 일치하지 않는다면
        if(password !== passwordConfirm){
            setError('비밀번호가 일치하지 않습니다.');
            dispatch(changeField({form:'register', key: 'password', value: ''}));
            dispatch(changeField({form:'register', key: 'passwordConfirm', value: ''}));
            return;
        }
        dispatch(register({username, password}));
    };

    useEffect(() => {
        dispatch(initalizeForm('register'));
    }, [dispatch]);

    useEffect(() => {
        if(authError) {
            // 계정명이 이미 존재할 때
            if(authError.response.status === 409) {
                setError('이미 존재하는 계정입니다.');
                return;
            }
            // 기타 이유
            setError('회원가입 실패');
            return;
        }
        if(auth) {
            console.log('회원가입 성공');
            console.log(auth);
            dispatch(check());
        }
    }, [auth, authError, dispatch]);

    useEffect(() => {
        if(user) {
            history.push('/');
            try{
                localStorage.setItem('user', JSON.stringify(user));
            } catch(e) {
                console.log('localStorage is not working');
            }
        }
    }, [history ,user]);

    return (
        <AuthForm
            type='register'
            form={form}
            onChange={onChange}
            onSubmit={onSubmit}
            error={error}
        />
    );
};

export default withRouter(RegisterForm);