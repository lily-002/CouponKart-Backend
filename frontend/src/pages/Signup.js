import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Form, Alert } from 'react-bootstrap';
import { BsCheckCircle } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import 
{
  setEmailOtp,
  setMobileOtp,
  verifyEmailOtp,
  verifyMobileOtp,
  setOtpError,
} from '../redux/otpSlice';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [showOtpFields, setShowOtpFields] = useState(false);

  const otpState = useSelector((state) => state.otp);
  const dispatch = useDispatch();

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors as the user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle OTP field changes
  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    if (name === 'emailOtp') {
      dispatch(setEmailOtp(value));
    } else if (name === 'mobileOtp') {
      dispatch(setMobileOtp(value));
    }
  };

  // Validate Form Data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'A valid email is required';
    if (!formData.mobile.trim() || !/^\+\d{1,4}\d{10}$/.test(formData.mobile))
      newErrors.mobile = 'A valid mobile number with country code is required (e.g., +1XXXXXXXXXX)';
    if (!formData.password.trim() || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  // Request OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
      mobile: formData.mobile, // Mobile number with country code combined
    };

    try {
      const response = await API.post('/users/register', payload);
      console.log('OTP sent successfully:', response.data);
      setShowOtpFields(true); // Show OTP fields after successful OTP request
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setErrors({ apiError: 'Failed to send OTP. Please try again.' });
    }
  };

  // Verify OTP
  const verifyOtp = async (type) => {
    const payload =
      type === 'email'
        ? { otp: otpState.emailOtp, email: formData.email }
        : { otp: otpState.mobileOtp, mobile: formData.mobile };

    const apiEndpoint = type === 'email' ? '/users/verify-email' : '/users/verify-mobile';

    try {
      const response = await API.post(apiEndpoint, payload);
      console.log(`${type} OTP verified:`, response.data);
      type === 'email' ? dispatch(verifyEmailOtp()) : dispatch(verifyMobileOtp());
    } catch (error) {
      dispatch(setOtpError('Error verifying OTP'));
    }
  };

  // Finalize account creation
  const handleCreateAccount = async () => {
    try {
      const response = await API.post('/users/complete-reg', formData);
      console.log('Account created successfully:', response.data);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">
            MyApp
          </Link>
          <Card.Title>Sign Up</Card.Title>
        </Card.Header>
        <Card.Body>
          {/* Display Global Errors */}
          {errors.apiError && <Alert variant="danger">{errors.apiError}</Alert>}

          {!showOtpFields ? (
            <Form onSubmit={handleSubmit}>
              {['name', 'email', 'mobile', 'password', 'confirmPassword'].map((field) => (
                <Form.Group key={field}>
                  <Form.Label>{field}</Form.Label>
                  <Form.Control
                    type={field.includes('password') ? 'password' : 'text'}
                    name={field}
                    placeholder={`Enter ${field}`}
                    value={formData[field]}
                    onChange={handleChange}
                    isInvalid={!!errors[field]}
                  />
                  <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
                </Form.Group>
              ))}
              <Button type="submit">Request OTP</Button>
            </Form>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Email OTP</Form.Label>
                <Form.Control
                  type="text"
                  name="emailOtp"
                  placeholder="Enter email OTP"
                  value={otpState.emailOtp}
                  onChange={handleOtpChange}
                />
                <Button onClick={() => verifyOtp('email')}>Verify Email</Button>
                {otpState.emailVerified && <BsCheckCircle className="text-success" />}
              </Form.Group>
              <Form.Group>
                <Form.Label>Mobile OTP</Form.Label>
                <Form.Control
                  type="text"
                  name="mobileOtp"
                  placeholder="Enter mobile OTP"
                  value={otpState.mobileOtp}
                  onChange={handleOtpChange}
                />
                <Button onClick={() => verifyOtp('mobile')}>Verify Mobile</Button>
                {otpState.mobileVerified && <BsCheckCircle className="text-success" />}
              </Form.Group>
              <Button onClick={handleCreateAccount}>Create Account</Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
