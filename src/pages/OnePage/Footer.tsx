
export const Footer = () => (
  <footer
    style={{ zIndex: 0 }}
    className="text-sm text-gray-300 mx-8 md:mx-12 absolute inset-x-0 bottom-5"
  >
    <div className="flex space-x-4 p-2 z-60">
      <a href="mailto:team@hello.app" target="_blank" rel="noopener noreferrer">
        <i className="h-5 w-5 zIndex-100 fas fa-envelope text-gray-300 hover:text-gray-500" />
      </a>
      <a
        href="https://www.linkedin.com/company/hellostorage"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="h-5 w-5 fab fa-linkedin text-gray-300 hover:text-gray-500" />
      </a>
      <a
        href="https://github.com/hello-storage"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="h-5 w-5 fab fa-github text-gray-300 hover:text-gray-500" />
      </a>
      <a href="https://twitter.com/joinhelloapp" target="_blank" rel="noopener noreferrer">
        <i className="h-5 w-5 fab fa-twitter text-gray-300 hover:text-gray-500" />
      </a>
      <a
        href="https://www.instagram.com/joinhelloapp/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="h-5 w-5 fab fa-instagram text-gray-300 hover:text-gray-500" />
      </a>
      <a
        href="https://www.tiktok.com/@gethelloapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="h-5 w-5 fab fa-tiktok text-gray-300 hover:text-gray-500" />
      </a>
    </div>
    © 2023 hello.app | all rights reserved.
  </footer>
);

export default Footer;
