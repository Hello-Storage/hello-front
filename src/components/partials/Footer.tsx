const Footer = () => {
    return (
			<div  style={{position: "relative", bottom: 0, left: 0, right: 0}} className="container">
				<footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
					<div className="col-md-4 d-flex align-items-center">
						<a
							href="https://www.linkedin.com/company/hellostorage/"
                            target="_blank"
							className="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1"
						>
                            LinkedIn
							<svg className="bi" width="30" height="24">
								<use x-link:href="#bootstrap"></use>
							</svg>
						</a>
						
						<span className="text-muted text-nowrap">© 2023 Hello Decentralized, SL</span>
					</div>

					<ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
						<li className="ms-3">
							<a className="text-muted" href="#">
								<svg className="bi" width="24" height="24">
									<use x-link:href="#twitter"></use>
								</svg>
							</a>
						</li>
						<li className="ms-3">
							<a className="text-muted" href="#">
								<svg className="bi" width="24" height="24">
									<use x-link:href="#instagram"></use>
								</svg>
							</a>
						</li>
						<li className="ms-3">
							<a className="text-muted" href="#">
								<svg className="bi" width="24" height="24">
									<use x-link:href="#facebook"></use>
								</svg>
							</a>
						</li>
					</ul>
				</footer>
			</div>
    )
}

export default Footer;