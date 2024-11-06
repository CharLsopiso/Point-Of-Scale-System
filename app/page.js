"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Image,
  Alert,
} from "react-bootstrap";
const backgroundImageUrl = "/assets/images/bg-pic.png";

const LoginPage = () => {
  const router = useRouter();

  const [accountList, setAccountList] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const getAccountData = async () => {
    try {
      const url = "http://localhost/api/login.php";
      const response = await axios.get(url);
      setAccountList(response.data);
    } catch (error) {
      setAlertMsg("Failed to load account data.");
    }
  };

  useEffect(() => {
    getAccountData();
  }, []);

  const login = () => {
    const account = accountList.find(
      (acc) =>
        acc.username.trim() === username.trim() && acc.password === password
    );

    if (!username) {
      setAlertMsg("Please select account first to login!");
      return;
    }

    if (!account) {
      setAlertMsg("Invalid username or password.");
      return;
    }

    sessionStorage.setItem("username", username);
    router.push(`./POS?username=${username}`);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        width: "100%",
        padding: "0",
        margin: "0",
      }}
    >
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Col lg={4}>
          <Card className="shadow bg-light">
            <div className="d-flex justify-content-center align-items-center mt-2 mb-3 me-2">
              <Image
                src="/assets/images/logo.png"
                width={74}
                height={74}
                alt="POS Logo"
              />
              <h5
                className="display-6 text-center mt-2"
                style={{ fontSize: "28px" }}
              >
                Point of Sale
              </h5>
            </div>
            <Card.Body>
            {alertMsg && (
              <Alert variant="danger" onClose={() => setAlertMsg("")} className="p-3">
                <h6 className="text-danger">{alertMsg}</h6>
              </Alert>
            )}
              <Form>
                <Form.Group controlId="username" className="mb-4">
                  <Form.Control
                    as="select"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Username
                    </option>
                    {accountList.map((account, index) => (
                      <option key={index} value={account.username}>
                        {account.username}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="password" className="mb-5">
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </Form.Group>
                <Button
                  variant="warning"
                  onClick={login}
                  className="w-100 shadow text-white"
                >
                  Sign in
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Container>
    </div>
  );
};

export default LoginPage;
