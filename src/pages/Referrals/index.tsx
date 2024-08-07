import { HiClipboard, HiOutlinePaperAirplane } from "react-icons/hi";
import { GoPeople } from "react-icons/go";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Api } from "api";
import { Link } from "react-router-dom";
import { Theme } from "state/user/reducer";
import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";


const copyToClipboard = (str: string) => {
  navigator.clipboard.writeText(str);
  toast.success("Copied referral link to clipboard!");
};

const Referrals = () => {
  const {lang} = useLanguage()

  const baseUrl = window.location.origin;

  const { walletAddress } = useAppSelector((state) => state.user);
  const referralLink = `${baseUrl}/space/login?ref=${walletAddress}`;

  const [referredAddresses, setReferredAddresses] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState<string>("");

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
          setReferredAddresses((res.data.referredAddresses && res.data.referredAddresses.length) ? 
            ["you", ...res.data.referredAddresses] : ["you"]);
          setReferredBy(res.data.referredBy || "");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [walletAddress]);

  const formatBytes = (bytes: number, decimals = 2, symbol = true) => {
    if (!+bytes) return "0 Bytes";
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${symbol ? sizes[i] : ""}`;
  };

  const {
    storageAvailable,
  } = useAppSelector((state) => state.userdetail);

  const totalUsers = parseInt(formatBytes(storageAvailable, 0, false)) / 5;
  const maxUsers = 20;
  // const referredByAddress = referredBy;

  const onSubmit = (values: any, { setSubmitting }: any) => {
    setTimeout(() => {
      //send mail here with values.email email and referralLink link
      window.open(
        `mailto:${values.email}?subject=Join me on Hello&body=Hi,%0D%0A%0D%0AI would like to invite you to join Hello Storage. It is a decentralized storage infrastructure across thousands of nodes around the world.%0D%0A%0D%0AYou can get 10GB of free storage for each referred user.%0D%0A%0D%0AHere is my referral link:%0D%0A${referralLink}`
      );
      setSubmitting(false);
    }, 400);
  };

	const {theme} = useAppSelector((state) => state.user);

  return (
    <div className="flex flex-col h-full max-h-full  relative">
      <Link
        to="/space/referrals"
        className={"p-2 text-xl inline-flex items-center hover:text-blue-600 cursor-pointer"
        +(theme===Theme.DARK? " text-white " : " text-gray-700")}
      >
        {/* Referrals */}
        {language[lang]["16"]}

      </Link>
      <hr className="mt-5 mb-3" />
      <div className="h-min min-h-min md:h-full p-8  flex flex-col items-center border rounded-xl">
        <div className="mb-4 flex items-center justify-center text-center w-full space-x-2">
          <GoPeople className="text-blue-600 w-7 h-7" />
          <h1 className={"md:text-2xl text-lg select-none tracking-tighter text-center "
            +(theme===Theme.DARK? " text-white " : " text-gray-700")}>
            {/* Get +5GB free for each referred user! */}
            {language[lang]["161"]}
          </h1>
        </div>
        <div className="flex-grow flex flex-col md:mt-20 mt-12 items-center max-w-xl">
          <div className="flex flex-col justify-start">
            <span className={"mb-2 text-sm"
              +(theme===Theme.DARK? " text-white " : " text-gray-700")}>
              {/* Invite your friends */}
              {language[lang]["162"]}
            </span>
            <div className="flex md:flex-row flex-col items-center gap-4">
              <div className="relative rounded-lg w-full md:w-3/4 max-w-md">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  onClick={() => {
                    copyToClipboard(referralLink);
                  }}
                  className={"pr-10 py-2.5 px-4 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-lg border-gray-200 border"
                  +(theme===Theme.DARK? " dark-theme3 " : " ")}
                />
                <div
                  className="absolute inset-y-0 right-0 px-2 flex items-center justify-center cursor-pointer rounded-lg border border-gray-100"
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
                  <div className="relative rounded-lg w-full md:w-3/4 max-w-md">
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
                          className={"w-full z-10 pr-16 py-2.5 px-4 focus:ring-indigo-500 focus:border-indigo-500 block rounded-lg border-gray-200 border"
                          +(theme===Theme.DARK? " dark-theme3 " : " ")}
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="absolute inset-y-0 right-0 px-3 gap-2 flex items-center cursor-pointer bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-lg"
                        >
                          <p>
                            {/* Send */}
                            {language[lang]["163"]}
                          </p>
                          <HiOutlinePaperAirplane className="h-4 w-4" />
                        </button>
                      </div>
                    </Form>
                  </div>
                )}
              </Formik>
            </div>
          </div>
          <hr className="w-full h-px my-8 bg-gray-200 border-0" />
          <div className={"flex justify-between border border-gray-200 rounded-lg p-4 "
          +(theme===Theme.DARK? " text-white" : " text-gray-800")}>
            <div>
              <p className="px-4 text-lg font-medium">
                {totalUsers}/{maxUsers} 
                {/* referred users. */}
                
                {` ${language[lang]["164"]}`}
              </p>
            </div>
            <div>
              <p className="px-4 text-lg font-medium">
              {/* GB storage gained. */}
              {formatBytes(storageAvailable, 2, false)} / {maxUsers * 5}{language[lang]["165"]}
              </p>
            </div>
          </div>
          <div className="w-full">
            <p className="pt-10 pb-4 w-full text-left">
              {/* You got // from // invited users */}
              {language[lang]["166"]} {totalUsers * 5}GB/{maxUsers * 5}GB {language[lang]["167"]} {totalUsers}{" "}
              {language[lang]["168"]}
            </p>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: maxUsers }).map((_, index) => (
                <div
                  key={index}
                  className={`md:h-6 md:w-12 h-4 w-6 rounded ${index < totalUsers ? "bg-green-500" : "bg-red-200"
                    } flex items-center justify-center`}
                  title={
                    index < totalUsers
                      ? `Invited user wallet address: ${referredAddresses[index]??"unknown"}`
                      : ""
                  }
                >
                  <p
                    className="text-white text-xs sm:text-sm leading-none select-none"
                  >
                    {index < totalUsers ? `+5GB` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {referredBy !== "" && (
          <div className="mb-4 flex flex-col  items-center">
            <div className="mb-4 flex flex-row items-center space-x-2">
              <p>
                {/* You were referred by: */}
                {language[lang]["169"]}
              </p>
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