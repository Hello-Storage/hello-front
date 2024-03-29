import React, { useState } from "react";
import OtpInput from "react-otp-input";
import { FaRegEnvelopeOpen, FaSpinner } from "react-icons/fa";
import { useAuth } from "hooks";
import { Modal, useModal } from "components/Modal";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";
import "./otp-style.css";

export default function OTPModal({ email }: { email: string }) {
  const { verifyOTP } = useAuth();
  const [, onDismiss] = useModal(<></>);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = async (otp: string) => {
    setOtp(otp);
    if (otp.length === 6) {
      setLoading(true);

      const success = await verifyOTP(email, otp);
      if (success) onDismiss();
      else {
        toast.error("invalid code");
        setOtp("");
      }
      setLoading(false);
    }
  };


  const { theme } = useAppSelector((state) => state.user);

  return (
    <Modal className={"p-10 rounded-lg w-[400px] relative" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")} >
      <div className="text-center mb-5">
        <FaRegEnvelopeOpen size={50} className="inline-block text-blue-500" />
      </div>
      <div className="text-center mb-3">
        <p>Please enter the code sent to <strong>{email}</strong>, if you don't get the code, also check the <strong>spam</strong> folder</p>
      </div>

      {loading ? (
        <div className="text-center">
          <FaSpinner
            className="animate-spin text-blue-500 inline-block"
            size={50}
          />
        </div>
      ) : (
        <OtpInput
          value={otp}
          onChange={onChange}
          numInputs={6}
          containerStyle="justify-center gap-3"
          inputType="number"
          renderInput={(props) => <input {...props} className="otp-input no-spinners" />}
          inputStyle={{ width: "auto" }}
        />
      )}
    </Modal>
  );
}