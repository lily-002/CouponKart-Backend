import React, { useState, useEffect } from "react";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          // Verify the token with the backend
          const response = await axios.get("http://localhost:5001/api/users/verify-token", {
              headers: {
                Authorization: `Bearer ${token}`, // Include token
              },
              withCredentials: true, // Include cookies if required
          });

          // If token is valid, redirect to the dashboard
          if (response.data.success) {
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Token verification error:", err);
          // Clear invalid token if verification fails
          localStorage.removeItem("authToken");
        }
      }
    };

    checkLoggedIn();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5001/api/users/login/",
        { email, password }
      );

      console.log("Login response data:", response.data);

      if (response.data && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem("authToken", response.data.token);

        // Redirect to the dashboard
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="page-sign">
      <Card className="card-sign">
        <Card.Header>
          <Link to="/" className="header-logo mb-4">dashbyte</Link>
          <Card.Title>Sign In</Card.Title>
          <Card.Text>Welcome back! Please sign in to continue.</Card.Text>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Form.Label className="d-flex justify-content-between">
                Password <Link to="">Forgot password?</Link>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-danger mb-3">{error}</div>}
            <Button type="submit" variant="primary" className="btn-sign">
              Sign In
            </Button>

            <div className="divider"><span>or sign in with</span></div>

            <Row className="gx-2">
              <Col>
                <Button variant="" className="btn-facebook">
                  <i className="ri-facebook-fill"></i> Facebook
                </Button>
              </Col>
              <Col>
                <Button variant="" className="btn-google">
                  <i className="ri-google-fill"></i> Google
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
        <Card.Footer>
          Don't have an account? <Link to="/signup">Create an Account</Link>
        </Card.Footer>
      </Card>
    </div>
  );
}
