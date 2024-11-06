"use client";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Container,
  Form,
  Table,
  Modal,
  Row,
  Col,
  Card,
  Button,
  Alert,
} from "react-bootstrap";

import TopNav from "@/components/nav";

const POS = () => {
  const [productList, setProductList] = useState([]);
  const [barCODE, setBarCODE] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [cash, setCash] = useState("");
  const [change, setChange] = useState(0);
  const [previousTransactions, setPreviousTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showZReportModal, setShowZReportModal] = useState(false);
  const [transactSuccess, setTransactSuccess] = useState("");
  const [barcodeNotExist, setBarcodeNotExist] = useState("");
  const [dailySales, setDailySales] = useState({});
  const [receipt, setReceipt] = useState("");

  const params = useSearchParams();
  const router = useRouter();
  const username = params.get("username");

  const saveInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const cashInputRef = useRef(null);

  const getProductFromAPI = async () => {
    try {
      const url = "http://localhost/api/products.php";
      const response = await axios.get(url);
      setProductList(response.data);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    getProductFromAPI();
  }, []);

  useEffect(() => {
    const storedTransactions =
      JSON.parse(localStorage.getItem("previousTransactions")) || [];
    setPreviousTransactions(storedTransactions);
    updateDailySales(storedTransactions);
  }, []);

  const updateDailySales = (transactions) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const dailyTotal = transactions
      .filter((transaction) => transaction.date === today)
      .reduce((total, transaction) => total + transaction.totalBalance, 0);
    setDailySales((prev) => ({ ...prev, [today]: dailyTotal }));
  };

  useEffect(() => {
    if (saveInputRef.current) {
      saveInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (quantity > 0 && barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [quantity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (barCODE.length >= 4 && quantity > 0) {
        const product = productList.find(
          (p) => p.barcode === parseInt(barCODE, 10)
        );
        if (product) {
          const selectedProductWithQuantity = {
            ...product,
            quantity: parseInt(quantity, 10),
          };
          setSelectedProducts((prevProducts) => [
            ...prevProducts,
            selectedProductWithQuantity,
          ]);
          setBarCODE("");
          setQuantity("");
          setBarcodeNotExist("");
          if (saveInputRef.current) {
            saveInputRef.current.focus();
          }
        } else {
          setBarcodeNotExist("Product with this barcode does not exist.");
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [barCODE, quantity, productList]);

  const calculateTotalBalance = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.product_price * product.quantity,
      0
    );
  };

  const handleCashChange = () => {
    const totalBalance = calculateTotalBalance();
    const cashAmount = parseFloat(cash) || 0;
    const calculatedChange = cashAmount - totalBalance;

    if (selectedProducts.length === 0) {
      alert(
        "No products added! Please add products to start a new transaction."
      );
    } else if (calculatedChange < 0) {
      alert("Not enough cash");
      setChange(0);
    } else {
      setChange(calculatedChange);
      setTransactSuccess("Transaction successful!");
      printReceipt(totalBalance, cashAmount, calculatedChange);
    }
  };

  const printReceipt = (totalBalance, cashAmount, change) => {
    // Ensure values are numbers
    const totalBalanceNum = Number(totalBalance);
    const cashAmountNum = Number(cashAmount);
    const changeNum = Number(change);
  
    const receiptHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt { width: 100%; max-width: 400px; margin: auto; }
            .header, .footer { text-align: center; }
            .details { margin: 20px; }
            .products { list-style: none; padding: 0; }
            .products li { margin: 5px; display: flex; justify-content: space-between; border-bottom: 1px solid #ddd; }
            .products li span { width: 25%; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>Grocery Point of Sale</h2>
              <p>Transaction Date & Time: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
              <p>Cashier: ${username || "Unknown User"}</p>
            </div>
            <div class="details">
              <h4>Products</h4>
              <ul class="products">
                ${selectedProducts
                  .map((product) => (
                    `<li>
                      <span>Quantity: ${product.quantity || 0}</span>
                      <span>Barcode: ${product.barcode || ""}</span>
                      <span>Product: ${product.product_name || ""}</span>
                      <span>
                        ₱${(Number(product.product_price) || 0).toFixed(2)}
                        (₱${(Number(product.product_price) * (Number(product.quantity) || 0)).toFixed(2)})
                      </span>
                    </li>`
                  ))
                  .join("")}
              </ul>
            </div>
            <div class="footer align-start">
              <p>Total Balance: ₱${totalBalanceNum.toFixed(2)}</p>
              <p>Cash Paid: ₱${cashAmountNum.toFixed(2)}</p>
              <p>Total Change: ₱${changeNum.toFixed(2)}</p>
              <p>Thank you for your purchase!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "l" || event.key === "L") {
        handleLogout();
      } else if (event.key === "x" || event.key === "X") {
        setShowModal(true);
      } else if (event.key === "z" || event.key === "Z") {
        setShowZReportModal(true);
      } else if (event.key === "Enter") {
        handleCashChange(); // Update total change when Enter is pressed
      } else if (event.key === "p" || event.key === "P") {
        if (cashInputRef.current) {
          cashInputRef.current.focus();
        }
      } else if (event.key === "t" || event.key === "T") {
        printReceipt();
      } else if (event.key === "s" || event.key === "S") {
        if (selectedProducts.length > 0) {
          const newTransaction = {
            username: username || "Unknown User",
            products: selectedProducts,
            totalBalance: calculateTotalBalance(),
            cashPaid: parseFloat(cash) || 0,
            change: change,
            date: new Date().toISOString().split("T")[0],
          };
          const updatedTransactions = [...previousTransactions, newTransaction];
          localStorage.setItem(
            "previousTransactions",
            JSON.stringify(updatedTransactions)
          );
          setPreviousTransactions(updatedTransactions);
          updateDailySales(updatedTransactions);
          setSelectedProducts([]);
          setCash("");
          setChange(0);
          setTransactSuccess("");
        } else {
          alert(
            "No products added! Please add products to start new transaction."
          );
        }
      } else if (event.key === "r" || event.key === "R") {
        const confirmReset = window.confirm(
          "Are you sure you want to reset transaction history?"
        );
        if (confirmReset) {
          setPreviousTransactions([]);
          localStorage.removeItem("previousTransactions");
          setDailySales({});
          alert("Previous transactions have been reset.");
        }
      } else if (event.key === "q" || event.key === "Q") {
        if (saveInputRef.current) {
          saveInputRef.current.focus();
        }
      } else if (event.key === "c" || event.key === "C") {
        if (showModal) {
          setShowModal(false);
        } else if (showZReportModal) {
          setShowZReportModal(false);
        }
      }
    };
  
    const handleKeyUp = (event) => {
      if (event.key === "t" || event.key === "T") {
        printReceipt();
      }
    };
  
    window.addEventListener("keypress", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
  
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    selectedProducts,
    previousTransactions,
    change,
    cash,
    username,
    showModal,
    showZReportModal,
  ]);

  useEffect(() => {
    if (!showModal && !showZReportModal && saveInputRef.current) {
      saveInputRef.current.focus();
    }
  }, [showModal, showZReportModal]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure to logout?");
    if (confirmLogout) {
      router.push("/");
    }
  };

  return (
    <>
      <div
        className="min-vh-100 d-flex flex-column"
        style={{ backgroundColor: "#f9f9f9" }}
      >
        <TopNav username={username} />
        <Container fluid className="flex-grow-1">
          <Row className="h-100" style={{ marginTop: "36px" }}>
            <Col lg={4} className="d-flex">
              <Card
                className="flex-grow-1 border-3 shadow p-2 rounded-0"
                style={{ borderColor: "#333333" }}
              >
                <Card.Body>
                  <Form>
                    <Form.Group controlId="quantity">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        ref={saveInputRef}
                        type="number"
                        value={quantity}
                        autoComplete="off"
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group controlId="barcode" className="mt-4 mb-2">
                      <Form.Label>Barcode</Form.Label>
                      <Form.Control
                        ref={barcodeInputRef}
                        type="number"
                        value={barCODE}
                        onChange={(e) => setBarCODE(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                  {barcodeNotExist && (
                    <Alert
                      variant="danger"
                      onClose={() => setAlertMsg("")}
                      className="p-3"
                    >
                      <h6 className="text-danger">{barcodeNotExist}</h6>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8}>
              <Card
                className="h-100 flex-grow-1 border-3 shadow p-2 rounded-0"
                style={{ borderColor: "#333333" }}
              >
                <Card.Header className="bg-transparent border-0">
                  <h5 className="float-end" style={{ fontSize: "46px" }}>
                    Total Balance:{" "}
                    <span style={{ color: "green" }}>
                      ₱ {calculateTotalBalance().toFixed(2)}
                    </span>
                  </h5>
                </Card.Header>
                <Card.Body>
                  {transactSuccess && (
                    <Alert
                      variant="success"
                      onClose={() => setAlertMsg("")}
                      className="p-3"
                    >
                      <h6 className="text-success" style={{ fontSize: "32px" }}>
                        {transactSuccess}
                      </h6>
                    </Alert>
                  )}
                  <Table hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Quantity</th>
                        <th>Barcode</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{product.quantity}</td>
                          <td>{product.barcode}</td>
                          <td>{product.product_name}</td>
                          <td>₱{product.product_price.toFixed(2)}</td>
                          <td>
                            ₱
                            {(product.product_price * product.quantity).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Container>
                    <Row>
                      <span
                        className="mb-3 mt-3"
                        style={{
                          backgroundColor: "#000000",
                          height: "2px",
                          border: "none",
                        }}
                      ></span>
                      <Col lg={6}>
                        <Form.Group controlId="cash" className="mt-3 mb-3">
                          <Form.Label>Pay Cash</Form.Label>
                          <Form.Control
                            ref={cashInputRef}
                            type="number"
                            value={cash}
                            onChange={(e) => setCash(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}></Col>
                    </Row>
                  </Container>

                  <h5 className="float-end" style={{ fontSize: "46px" }}>
                    Total Change:
                    <span style={{ color: "green" }}>
                      {" "}
                      ₱ {change.toFixed(2)}
                    </span>
                  </h5>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Shift Reports Modal */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header className="bg-success">
          <Modal.Title className="text-center text-white">
            Shift Reports
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {previousTransactions.length > 0 ? (
            previousTransactions.map((transaction, index) => (
              <div key={index} className="mb-3">
                <h6>
                  <span style={{ color: "gray" }}>Cashier name:</span>{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {transaction.username}
                  </span>
                </h6>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Quantity</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.products.map((product, prodIndex) => (
                      <tr key={prodIndex}>
                        <td>{product.quantity || 0}</td>
                        <td>{product.product_name || "N/A"}</td>
                        <td>₱{(product.product_price || 0).toFixed(2)}</td>
                        <td>
                          ₱
                          {(
                            (product.product_price || 0) *
                            (product.quantity || 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3}>
                        <h6>Total Balance:</h6>
                      </td>
                      <td>₱{(transaction.totalBalance || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <h6>Cash Paid:</h6>
                      </td>
                      <td>₱{(transaction.cashPaid || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <strong>Total Change:</strong>
                      </td>
                      <td>
                        <strong style={{ color: "#198754" }}>
                          ₱{(transaction.change || 0).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            ))
          ) : (
            <p>No previous transactions found.</p>
          )}
        </Modal.Body>
      </Modal>
      {/* Z Report Modal */}
      <Modal
        size="lg"
        show={showZReportModal}
        onHide={() => setShowZReportModal(false)}
      >
        <Modal.Header className="bg-success">
          <Modal.Title className="text-center text-white">Z Report</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <h5>Daily Sales Report</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(dailySales).length > 0 ? (
                Object.keys(dailySales).map((date, index) => (
                  <tr key={index}>
                    <td>{date}</td>
                    <td>₱{dailySales[date].toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>No sales data available for today.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default POS;
