import {
  HiClipboard,
  HiOutlinePaperAirplane,
  HiOutlineUsers,
} from "react-icons/hi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Api } from "api";

const copyToClipboard = (str: string) => {
  navigator.clipboard.writeText(str);
  toast.success("Copied referral link to clipboard!");
};

const Referrals = () => {
  const baseUrl = window.location.origin;

  const { walletAddress } = useAppSelector((state) => state.user);
  const referralLink = `${baseUrl}/login?ref=${walletAddress}`;

  const [referredAddresses, setReferredAddresses] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState<string>("");

  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const initialValues = {
    email: "",
  };

  useEffect(() => {
    Api.get(`/referrals/${walletAddress}`)
      .then((res) => {
        if (res.data.status === "success") {
          setReferredAddresses(res.data.referredAddresses || []);
          setReferredBy(res.data.referredBy || "");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    //const account = Web3.eth.accounts.create();
    //console.log(account.address);
    //const string = "gu22mGm7puJQ3wFGjmKBiRoV+AFGk1gOwbOGqUXLYyZ7uvWV7NBm8thELyEAi2KhOrBN6YCUk0R8aEMutRTX+WwNig9JFcSLQWX5w+e6UHIm/zAueNaMZvHCGU/4Og==";
    //const data = Buffer.from(string, 'base64');

    //console.log(data.toString('latin1'));
  }, [walletAddress]);

  const totalUsers = referredAddresses.length;
  const maxUsers = 9;
  const referredByAddress = referredBy;

  const onSubmit = (values: any, { setSubmitting }: any) => {
    setTimeout(() => {
      //send mail here with values.email email and referralLink link
      window.open(
        `mailto:${values.email}?subject=Join me on Hello&body=Hi,%0D%0A%0D%0AI would like to invite you to join Hello Storage. It is a decentralized storage infrastructure across thousands of nodes around the world.%0D%0A%0D%0AYou can get 10GB of free storage for each referred user.%0D%0A%0D%0AHere is my referral link:%0D%0A${referralLink}`
      );
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full relative">
      <a
        onClick={() => navigate("/referrals")}
        className="p-2 text-xl inline-flex items-center text-gray-700 hover:text-blue-600 cursor-pointer"
      >
        Referrals
      </a>
      <hr className="mt-5 mb-3" />
      <div className="h-full p-8 flex flex-col justify-center items-center border rounded-xl">
        <div className="mb-4 flex items-center justify-center text-center w-full space-x-2">
          <HiOutlineUsers className="text-blue-600 w-9 h-9" />
          <h1 className="md:text-3xl text-lg select-none text-center text-violet-700 hover:text-violet-600">
            Get +10GB free for each referred user!
          </h1>
        </div>
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="mb-4 relative rounded-md shadow-sm w-3/4 max-w-md">
            <input
              type="text"
              readOnly
              value={referralLink}
              onClick={() => {
                copyToClipboard(referralLink);
              }}
              className="pr-8 text-xl p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md border-gray-300 border-2"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => copyToClipboard(referralLink)}
            >
              <HiClipboard className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <div className="mb-6 pt-6 relative rounded-md shadow-sm w-3/4 max-w-md">
                <ErrorMessage
                  name="email"
                  component="div"
                  className="absolute top-0 left-0 w-full text-red-500"
                />
                <Form className="w-full">
                  <div className="relative">
                    <Field
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      className="w-full z-10 pr-16 text-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 block rounded-md border-gray-300 border-2"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                      <HiOutlinePaperAirplane className="h-5 w-5" />
                      <p>Send</p>
                    </button>
                  </div>
                </Form>
              </div>
            )}
          </Formik>
          <div className="flex justify-between border border-gray-300 rounded-md p-4">
            <div>
              <p className="px-4 text-lg font-medium">
                {totalUsers}/{maxUsers} referred users.
              </p>
            </div>
            <div>
              <p className="px-4 text-lg font-medium">
                {totalUsers * 10}GB/{maxUsers * 10}GB storage gained.
              </p>
            </div>
          </div>
          <div>
            <p className="pt-10 w-full md:text-xl text-left">
              You got {totalUsers * 10}GB/{maxUsers * 10}GB from {totalUsers}{" "}
              invited users
            </p>
            <div className="grid grid-cols-9 gap-2">
              {Array.from({ length: maxUsers }).map((_, index) => (
                <div
                  key={index}
                  className={`h-8 w-10 sm:w-20 p-2 rounded ${index < totalUsers ? "bg-green-500" : "bg-red-500"
                    } hover:bg-blue-500 fex items-center`}
                  title={
                    index < totalUsers
                      ? `Invited user wallet address: ${referredAddresses[index]}`
                      : ""
                  }
                >
                  <p style={{ marginLeft: "-5px" }} className="text-white text-xs sm:text-sm leading-none select-none">
                    
                    {index < totalUsers ? `+10GB` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {referredBy !== "" && (
          <div className="mb-4 flex flex-col  items-center">
            <div className="mb-4 flex flex-row items-center space-x-2">
              <p>You were referred by:</p>
            </div>
            <div className="mb-4 flex flex-row items-center space-x-2">
              <p>{referredBy}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
