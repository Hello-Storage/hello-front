
const Footer = () => (
  <footer style={{ zIndex: 0 }} className="text-sm text-gray-300 mx-8 md:mx-12 absolute inset-x-0 bottom-5">
    <div className="flex space-x-4 p-2 z-60">
      <a href="mailto:team@hello.app" target="_blank" rel="noopener noreferrer">
        <i className="zIndex-100 fas fa-envelope text-gray-300 hover:text-gray-500" />
      </a>
      <a href="https://www.linkedin.com/company/hellostorage" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-linkedin text-gray-300 hover:text-gray-500" />
      </a>
      <a href="https://github.com/hello-storage" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-github text-gray-300 hover:text-gray-500" />
      </a>
    </div>
    © 2024 hello.app. All rights reserved.
  </footer>
);

export default Footer;
