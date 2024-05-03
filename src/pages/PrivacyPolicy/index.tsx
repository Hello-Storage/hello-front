import { Link } from "react-router-dom";
import LogoHello from "@images/beta.png";
import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | hello.app</title>
        <meta name="description" content="Privacy Policy for hello.app" />
      </Helmet>
      <div className="overflow-auto custom-scrollbar max-h-screen  bg-[#05072b] flex items-center flex-col relative w-screen">
        <p className="absolute top-0 right-2 bg-[#32334b] text-white p-2 rounded-lg m-2">
          Updated: 04/02/2024
        </p>
        <div className="flex items-center gap-3 absolute top-0 left-2  text-white p-2 m-2">
          <Link
            to="/space/my-storage"
            className="text-2xl font-semibold font-[Outfit]"
          >
            hello.app
          </Link>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>
        <h1 className="bg-[#32334b] text-white text-2xl font-bold p-[10px] rounded-lg mt-[50px] mb-[15px]">
          <u>Privacy Policy for hello.app</u>
        </h1>
        <div className="text-left">
          <div className="flex items-center justify-center flex-col">
            <div className=" privacy-p-container">
              <p>
                Welcome to hello.app ("we", "us", or "our"). We are committed to
                protecting your personal information and your right to privacy.
                If you have any questions or concerns about this privacy notice
                or our practices with regard to your personal information,
                please contact us at{" "}
                <a className="text-blue-500" href="mailto:team@hello.app">
                  team@hello.app
                </a>
              </p>

              <p>
                Visit our website at{" "}
                <a className="text-blue-500" href="https://hello.app/">
                  https://hello.app
                </a>
              </p>
            </div>

            <div className=" privacy-p-container">
              <p className="mt-2 mb-2">
                <b>
                  This privacy notice describes how we might use your
                  information if you:
                </b>
              </p>

              <p>
                Engage with us in other related ways ― including any sales,
                marketing, or events
              </p>
              <p>In this privacy notice, if we refer to:</p>

              <ul>
                <li>
                  <b>"Website"</b>, we are referring to any website of ours that
                  references or links to this policy
                </li>
                <li>
                  <b>"Services"</b>, we are referring to our Website, and other
                  related services, including any sales, marketing, or events
                </li>
              </ul>
              <p className="mt-2 mb-2">
                Please read this privacy policy carefully, as it will help you
                understand what we do with the information that we collect.
              </p>
            </div>
            <div className="privacy-p-container">
              <h3>
                <b>1. WHAT INFORMATION DO WE COLLECT?</b>
              </h3>
              <p>Personal Information You Disclose to Us</p>
              <p>We collect personal information that you provide to us.</p>

              <p>
                We collect personal information that you voluntarily provide to
                us when you register on the Website, express an interest in
                obtaining information about us or our products and services,
                when you participate in activities on the Website, or otherwise
                when you contact us.
              </p>

              <p className="mt-2">
                <b>
                  The personal information that we collect depends on the
                  context of your interactions with us and the Website, the
                  choices you make, and the products and features you use. The
                  personal information we collect may include the following:
                </b>
              </p>

              <p>·Publicly available personal information.</p>
              <p>
                ·Personal Information Provided by You. We collect names; email
                addresses; usernames; contact preferences; contact or
                authentication data; and other similar information.
              </p>
              <p>
                ·Social Media Login Data. We may provide you with the option to
                register with us using your existing Google account details, for
                a quicker and easier sign-up process. If you choose to register
                in this way, we will collect the information described in the
                section called "HOW DO WE HANDLE YOUR SOCIAL LOGINS" below.
              </p>
              <p>·Information automatically collected</p>
              <p>
                ·In some cases, we automatically collect certain information
                when you visit our Website or use our Services.
              </p>
              <p>·Information collected through our App</p>
              <p>
                ·We collect information regarding your mobile device, push
                notifications, when you use our app.
              </p>

              <p>
                This information is primarily needed to maintain the security
                and operation of our App, for troubleshooting, and for our
                internal analytics and reporting purposes.
              </p>
            </div>
            <div className="privacy-p-container">
              <h3 className="mb-2">
                <b>2. HOW DO WE USE YOUR INFORMATION?</b>
              </h3>
              <p>
                We process your information for purposes based on legitimate
                business interests, the fulfillment of our contract with you,
                compliance with our legal obligations, and/or your consent.
              </p>

              <p>
                We use personal information collected via our Website for a
                variety of business purposes described below. We process your
                personal information for these purposes in reliance on our
                legitimate business interests, in order to enter into or perform
                a contract with you, with your consent, and/or for compliance
                with our legal obligations. We indicate the specific processing
                grounds we rely on next to each purpose listed below.
              </p>

              <p className="mt-2">
                <b>We use the information we collect or receive:</b>
              </p>

              <p>
                To facilitate account creation and logon process. If you choose
                to link your account with us to a third-party account (such as
                your Google account), we use the information you allowed us to
                collect from those third parties to facilitate account creation
                and logon process for the performance of the contract.
              </p>
              <p>
                To send you marketing and promotional communications. We and/or
                our third-party marketing partners may use the personal
                information you send to us for our marketing purposes, if this
                is in accordance with your marketing preferences. You can
                opt-out of our marketing emails at any time (see the "WHAT ARE
                YOUR PRIVACY RIGHTS?" below).
              </p>
              <p>
                To send administrative information to you. We may use your
                personal information to send you product, service, and new
                feature information and/or information about changes to our
                terms, conditions, and policies.
              </p>
              <p>
                Fulfill and manage your orders. We may use your information to
                fulfill and manage your orders, payments, returns, and exchanges
                made through the Website or App.
              </p>
              <p>
                To post testimonials. We post testimonials on our Website that
                may contain personal information. Before posting a testimonial,
                we will obtain your consent to use your name and the content of
                the testimonial. If you wish to update or delete your
                testimonial, please contact us at team@hello.app and be sure to
                include your name, testimonial location, and contact
                information.
              </p>
              <p>
                Request feedback. We may use your information to request
                feedback and to contact you about your use of our Website.
              </p>
              <p>
                To protect our Services. We may use your information as part of
                our efforts to keep our Website safe and secure (for example,
                for fraud monitoring and prevention).
              </p>
              <p>
                To enforce our terms, conditions, and policies for business
                purposes, to comply with legal and regulatory requirements, or
                in connection with our contract.
              </p>
              <p>
                To respond to legal requests and prevent harm. If we receive a
                subpoena or other legal request, we may need to inspect the data
                we hold to determine how to respond.
              </p>
              <p>
                For other business purposes. We may use your information for
                other business purposes, such as data analysis, identifying
                usage trends, determining the effectiveness of our promotional
                campaigns, and to evaluate and improve our Website, products,
                marketing, and your experience.
              </p>
            </div>
            <div className="privacy-p-container">
              <h3 className="mt-2 mb-2">
                <b>3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</b>
              </h3>
              <p>
                We only share information with your consent, to comply with
                laws, to provide you with services, to protect your rights, or
                to fulfill business obligations.
              </p>

              <p>
                We may process or share your data that we hold based on the
                following legal basis:
              </p>

              <p>
                Consent: We may process your data if you have given us specific
                consent to use your personal information for a specific purpose.
              </p>
              <p>
                <b>Legitimate Interests</b>: We may process your data when it is
                reasonably necessary to achieve our legitimate business
                interests.
              </p>
              <p>
                <b>Performance of a Contract</b>: Where we have entered into a
                contract with you, we may process your personal information to
                fulfill the terms of our contract.
              </p>
              <p>
                <b>Legal Obligations</b>: We may disclose your information where
                we are legally required to do so in order to comply with
                applicable law, governmental requests, a judicial proceeding,
                court order, or legal process, such as in response to a court
                order or a subpoena (including in response to public authorities
                to meet national security or law enforcement requirements).
              </p>
              <p>
                <b>Vital Interests</b>: We may disclose your information where
                we believe it is necessary to investigate, prevent, or take
                action regarding potential violations of our policies, suspected
                fraud, situations involving potential threats to the safety of
                any person, and illegal activities, or as evidence in litigation
                in which we are involved.
              </p>
              <p className="mb-3">
                More specifically, we may need to process your data or share
                your personal information in the following situations:
              </p>

              <p>
                <b>Business Transfers</b>: We may share or transfer your
                information in connection with, or during negotiations of, any
                merger, sale of company assets, financing, or acquisition of all
                or a portion of our business to another company.
              </p>
              <p>
                <b>Google OAuth</b>: <b>hello.app</b> uses Google OAuth for
                authentication and access to Google user data. We adhere to
                Google’s Limited Use requirements and ensure your Google data is
                handled securely and in accordance with our privacy policy and
                Google’s guidelines.
              </p>
            </div>
            <div className="privacy-p-container">
              <h3 className="mt-2 mb-2">
                <b>4. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</b>
              </h3>
              <p>
                If you choose to register or log in to our services using a
                social media account, we may have access to certain information
                about you.
              </p>

              <p>
                Our Website offers you the option to register and login using
                your third-party social media account details (like your Google
                logins). Where you choose to do this, we will receive certain
                profile information about you from your social media provider.
                The profile information we receive may vary depending on the
                social media provider concerned, but will often include your
                name, email address, friends list, profile picture as well as
                other information you choose to make public on such social media
                platform.
              </p>

              <p>
                We will use the information we receive only for the purposes
                that are described in this privacy policy or that are otherwise
                made clear to you on the relevant Website. Please note that we
                do not control, and are not responsible for, other uses of your
                personal information by your third-party social media provider.
                We recommend that you review their privacy policy to understand
                how they collect, use, and share your personal information, and
                how you can set your privacy preferences on their sites and
                apps.
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mt-2 mb-2">
                <b>5. HOW LONG DO WE KEEP YOUR INFORMATION?</b>
              </h3>
              <p>
                We keep your information for as long as necessary to fulfill the
                purposes outlined in this privacy policy unless otherwise
                required by law.
              </p>

              <p>
                We will only keep your personal information for as long as it is
                necessary for the purposes set out in this privacy policy,
                unless a longer retention period is required or permitted by law
                (such as tax, accounting, or other legal requirements). No
                purpose in this policy will require us keeping your personal
                information for longer than 1 month.
              </p>

              <p>
                When we have no ongoing legitimate business need to process your
                personal information, we will either delete or anonymize such
                information, or, if this is not possible (for example, because
                your personal information has been stored in backup archives),
                then we will securely store your personal information and
                isolate it from any further processing until deletion is
                possible.
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mb-2 mt-2">
                <b>6. HOW DO WE KEEP YOUR INFORMATION SAFE?</b>
              </h3>
              <p>
                We aim to protect your personal information through a system of
                organizational and technical security measures.
              </p>

              <p>
                We have implemented appropriate technical and organizational
                security measures designed to protect the security of any
                personal information we process. However, despite our safeguards
                and efforts to secure your information, no electronic
                transmission over the Internet or information storage technology
                can be guaranteed to be 100% secure, so we cannot promise or
                guarantee that hackers, cybercriminals, or other unauthorized
                third parties will not be able to defeat our security, and
                improperly collect, access, steal, or modify your information.
                Although we will do our best to protect your personal
                information, transmission of personal information to and from
                our Website is at your own risk. You should only access the
                Website within a secure environment.
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mb-2 mt-2">
                <b>7. WHAT ARE YOUR PRIVACY RIGHTS?</b>
              </h3>
              <p>
                You have rights that allow you greater access to and control
                over your personal information. You may review, change, or
                terminate your account at any time.
              </p>

              <p>
                Depending on your location, you may have certain rights under
                applicable data protection laws. These may include the right (i)
                to request access and obtain a copy of your personal
                information, (ii) to request rectification or erasure; (iii) to
                restrict the processing of your personal information; and (iv)
                if applicable, to data portability. In certain circumstances,
                you may also have the right to object to the processing of your
                personal information. To make such a request, please use the
                contact details provided below. We will consider and act upon
                any request in accordance with applicable data protection laws.
              </p>

              <p>
                If we are relying on your consent to process your personal
                information, you have the right to withdraw your consent at any
                time. Please note however that this will not affect the
                lawfulness of the processing before its withdrawal, nor will it
                affect the processing of your personal information conducted in
                reliance on lawful processing grounds other than consent.
              </p>

              <p>
                If you are a resident in the European Economic Area and you
                believe we are unlawfully processing your personal information,
                you also have the right to complain to your local data
                protection supervisory authority. You can find their contact
                details here: [Link to data protection authorities].
              </p>

              <p>
                If you have questions or comments about your privacy rights, you
                may email us at team@hello.app
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mb-2 mt-2">
                <b>8. CONTROLS FOR DO-NOT-TRACK FEATURES</b>
              </h3>
              <p>
                Most web browsers and some mobile operating systems and mobile
                applications include a Do-Not-Track (“DNT”) feature or setting
                you can activate to signal your privacy preference not to have
                data about your online browsing activities monitored and
                collected. At this stage, no uniform technology standard for
                recognizing and implementing DNT signals has been finalized. As
                such, we do not currently respond to DNT browser signals or any
                other mechanism that automatically communicates your choice not
                to be tracked online. If a standard for online tracking is
                adopted that we must follow in the future, we will inform you
                about that practice in a revised version of this privacy policy.
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mt-2 mb-2">
                <b>9. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</b>
              </h3>
              <p>
                Yes, if you are a resident of California, you are granted
                specific rights regarding access to your personal information.
              </p>

              <p>
                California Civil Code Section 1798.83, also known as the “Shine
                The Light” law, permits our users who are California residents
                to request and obtain from us, once a year and free of charge,
                information about categories of personal information (if any) we
                disclosed to third parties for direct marketing purposes and the
                names and addresses of all third parties with which we shared
                personal information in the immediately preceding calendar year.
                If you are a California resident and would like to make such a
                request, please submit your request in writing to us using the
                contact information provided below.
              </p>

              <p>
                If you are under 18 years of age, reside in California, and have
                a registered account with the Website, you have the right to
                request removal of unwanted data that you publicly post on the
                Website. To request removal of such data, please contact us
                using the contact information provided below, and include the
                email address associated with your account and a statement that
                you reside in California. We will make sure the data is not
                publicly displayed on the Website, but please be aware that the
                data may not be completely or comprehensively removed from all
                our systems (e.g., backups, etc.).
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mb-2 mt-2">
                <b>10. DO WE MAKE UPDATES TO THIS POLICY?</b>
              </h3>
              <p>
                Yes, we will update this policy as necessary to stay compliant
                with relevant laws.
              </p>

              <p>
                We may update this privacy policy from time to time. The updated
                version will be indicated by an updated “Revised” date and the
                updated version will be effective as soon as it is accessible.
                If we make material changes to this privacy policy, we may
                notify you either by prominently posting a notice of such
                changes or by directly sending you a notification. We encourage
                you to review this privacy policy frequently to be informed of
                how we are protecting your information.
              </p>
            </div>

            <div className="privacy-p-container">
              <h3 className="mb-2 mt-2">
                <b>11. HOW CAN YOU CONTACT US ABOUT THIS POLICY?</b>
              </h3>
              <p>
                If you have questions or comments about this policy, you may
                email us at team@hello.app or by post to:
              </p>

              <p>hello.app</p>
              <p>C\Badajoz 32</p>
              <p>Barcelona, 08005</p>
              <p>Spain</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
