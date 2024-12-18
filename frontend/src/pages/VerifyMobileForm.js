import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyMobileForm = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const mobile =
    location.state?.mobile || JSON.parse(sessionStorage.getItem("userRegistrationData"))?.mobile;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5001/api/users/verify-mobile",
        { mobile, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Mobile verification successful!");

      // Clear session storage after successful OTP verification
      sessionStorage.removeItem("userRegistrationData");

      // Redirect to the next page (e.g., dashboard)
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
      alert("An error occurred during mobile verification.");
    }
  };

  return (
    <div>
      <h2>Verify Mobile</h2>
      <form onSubmit={handleSubmit}>
        <p>OTP sent to: {mobile}</p>
        <label>
          OTP:
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyMobileForm;
