import React, { useState } from "react";
import OtpInput from "react-otp-input";
import { FaRegEnvelopeOpen } from "react-icons/fa";
import { useAuth } from "hooks";
import { Modal } from "components/Modal";
import { Spinner1 } from "components/Spinner";

export default function OTPModal({ email }: { email: string }) {
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = async (otp: string) => {
    setOtp(otp);
    if (otp.length === 6) {
      setLoading(true);
      await verifyOTP(email, otp);
      setLoading(false);
    }
  };

  return (
    <Modal className="p-10 bg-white rounded-lg w-[400px] relative">
      <div className="text-center mb-5">
        <FaRegEnvelopeOpen size={50} className="inline-block text-blue-500" />
      </div>
      <div className="text-center mb-3">
        <p>Please enter the code sent to</p>
        <strong>{email}</strong>
      </div>

      {loading ? (
        <Spinner1 />
      ) : (
        <OtpInput
          value={otp}
          onChange={onChange}
          numInputs={6}
          containerStyle="justify-center gap-3"
          inputType="number"
          renderInput={(props) => <input {...props} className="otp-input" />}
          inputStyle={{ width: "auto" }}
        />
      )}
    </Modal>
  );
}
