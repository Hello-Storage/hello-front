import "./TerminalCopyContainer.css";
import { toast } from "react-toastify";
export const TerminalCopyContainer: React.FC<{
  contentToCopy: string;
}> = ({ contentToCopy }) => {
  function oncopy() {
    navigator.clipboard.writeText(contentToCopy.split("%").join(";     ")).then(() => {
      toast.success("Copied to clipboard");
    });
  }

  return (
    <div className="card-terminal-container">
      <div className="wrap-terminal-container">
        <div className="terminal">
          <hgroup className="head">
            <p className="title">Your Identification</p>

            <button
              className="copy_toggle"
              tabIndex={-1}
              type="button"
              onClick={oncopy}
            >
              <svg
                width="16px"
                height="16px"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
              >
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
              </svg>
            </button>
          </hgroup>

          <div className="body">
            <pre className="pre">
              <div className="flex flex-col items-start justify-start overflow-auto">
                {contentToCopy.split("%").map((line, i) => (
                  <>
                    <code key={i}>-&nbsp; {line}</code>
                  </>
                ))}
              </div>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
