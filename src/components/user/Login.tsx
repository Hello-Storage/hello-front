const roundedDivStyle = {
    width: "299px",
    height: "199px",
    borderRadius: "19px",
    backgroundColor: "#f4f5f5",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    margin: "-1 auto",

}

const Login = () => {


    return (
        <div className="d-flex flex-column h-75 container mt-4 align-items-center justify-content-center">
            <div className="rounded-top text-center text-dark p-2">
            <p className="m-0" style={{ color: "#999999" }}>Login with provider</p>
            </div>
            <div style={roundedDivStyle} className="rounded-div">
                <button className="btn btn-primary" onClick={() => alert("Connecting to Metamask...")}>
                    {/* <img src={metamaskLogo} alt="Metamask Logo" className="metamask-logo"/> */}
                    Connect with Metamask
                </button>
            </div>
        </div>
    )
}

export default Login;