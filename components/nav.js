import { Container, Navbar, Image } from "react-bootstrap";

const TopNav = ({ username }) => {
  return (
    <>
      <Navbar
        style={{
          backgroundColor: "#009933",
        }}
        className="p-1 shadow"
      >
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="d-flex align-items-center">
            <Image
              className="me-2"
              src={"/assets/images/logo.png"}
              width={48}
              height={48}
            />
            <small className="text-white fw-bold">Point of Scale</small>
          </Navbar.Brand>
          <Navbar.Toggle className="border-0" aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="d-flex justify-content-end">
            <Navbar.Text className="d-flex flex-column text-white">
              <small className="text-warning fw-bold" style={{fontSize: '18px'}}>{username}</small>
              <p className="text-white mb-0">Current user</p>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default TopNav;
