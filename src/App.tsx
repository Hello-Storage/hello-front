import "./App.css";
import DataUploadDisplay from "./components/DataUploadDisplay";
import Footer from "./components/Footer";
import Typical from "react-typical";

function App() {
	return (
		<div id="App">
			<div className="container p-5 rounded">
				<h1 className="mt-5 text-right">
					<Typical
						steps={[
							"Hello.",
							2000,
							"We don't know who you are...",
							3000,
							"We don't know what you store...",
							3000,
							"But we know you need privacy...",
							3000,
							"And we've got just the solution.",
							3000,
							"Welcome to a new era of storage.",
							3000,
							"Decentralized. Secure. Private.",
							3000,
							"Hello | Decentralized",
							3000,
						]}
						loop={1}
					/>
				</h1>
				<p className="lead">
					Welcome to Hello, an open-source, encrypted, and
					user-controlled decentralized storage software designed for
					both web3 and traditional users. Our platform securely
					stores data across a decentralized infrastructure, ensuring
					transparency and accessibility. We prioritize efficiency,
					sustainability, and decentralization, utilizing unused
					storage space and constantly fine-tuning our operations for
					unmatched scalability. By adopting a carbon-neutral
					approach, we contribute to a sustainable and eco-friendly
					digital ecosystem.
				</p>
				<div className="mt-5">
					<div className="row row-cols-1 row-cols-md-3 g-4 h-100">
						<div className="col d-flex">
							<div className="bg-dark text-white p-3 rounded d-flex flex-column justify-content-between grid-container">
								<div className="emoji text-center">
									<span className="fs-1">🌐</span>
								</div>
								<div className="bg-light text-dark p-2 rounded text-center title">
									<h2
										className="m-0"
										style={{ wordWrap: "break-word" }}
									>
										Web3
									</h2>
								</div>
								<div className="text-white p-2 text-box">
									<p className="m-0 text-justify">
										Hello embraces the principles of web3,
										providing a connected and user-centric
										web experience. Our decentralized
										infrastructure solution promotes
										transparency and inclusivity without a
										single entry point spreading across
										hundreds of nodes and backed by
										Filecoin.
									</p>
								</div>
							</div>
						</div>
						<div className="col d-flex">
							<div className="bg-dark text-white p-3 rounded d-flex flex-column justify-content-between grid-container">
								<div className="emoji text-center">
									<span className="fs-1">🔒</span>
								</div>
								<div className="bg-light text-dark p-2 rounded text-center title">
									<h2
										className="m-0"
										style={{ wordWrap: "break-word" }}
									>
										Privacy
									</h2>
								</div>
								<div className="text-white p-2 text-box">
									<p className="m-0 text-justify">
										Hello prioritizes the privacy of user
										data by incorporating end to end
										encryption and user control. Unencrypted
										data never leaves your device. We ensure
										that your data remains confidential and
										protected from unauthorized access.
									</p>
								</div>
							</div>
						</div>
						<div className="col d-flex">
							<div className="bg-dark text-white p-3 rounded d-flex flex-column justify-content-between grid-container">
								<div className="emoji text-center">
									<span className="fs-1">🧩</span>
								</div>
								<div className="bg-light text-dark p-2 rounded text-center title">
									<h2
										className="m-0"
										style={{ wordWrap: "break-word" }}
									>
										Decentralization
									</h2>
								</div>
								<div className="text-white p-2 text-box">
									<p className="m-0 text-justify">
										Hello leverages unused storage space all
										around the world, adopting a
										decentralized approach to optimize
										efficiency and horizontal scalability.
										Our sustainable network operates without
										the need on creating new servers,
										reducing our carbon footprint.
									</p>
								</div>
							</div>
						</div>
					</div>
					{/*price per gigabyte $0.008 (make nice h styling with gradient*/}
					<DataUploadDisplay />
					<h3 className="mt-5 text-center">Coming Soon...</h3>
				</div>
			</div>
			<Footer />
		</div>
	);
}

export default App;
