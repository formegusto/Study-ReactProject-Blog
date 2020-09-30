import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForm from '../../components/auth/AuthForm';
import { changeField, initalizeForm } from '../../modules/auth';

const RegisterForm = () => {
    const dispatch = useDispatch();
    const { form } = useSelector(({auth}) => ({
        form: auth.register
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
        // 구현예정
    };

    useEffect(() => {
        dispatch(initalizeForm('register'));
    }, [dispatch]);

    return (
        <AuthForm
            type='register'
            form={form}
            onChange={onChange}
            onSubmit={onSubmit}
        />
    );
};

export default RegisterForm;