// pages/sellerApplications/SellerApplications.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Card,
  Form,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaStore,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaUsers,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";
import Header from "../../components/header/header";
import "./SellerApplications.css";

const API_URL = process.env.REACT_APP_API_URL;

const SellerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showDetail, setShowDetail] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH APPLICATIONS =================
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data.applications || []);
      setFilteredApps(res.data.applications || []);
      setError("");
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError(err.response?.data?.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ================= FILTER APPLICATIONS =================
  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.fullName?.toLowerCase().includes(term) ||
          app.email?.toLowerCase().includes(term) ||
          app.businessName?.toLowerCase().includes(term) ||
          app.trackingId?.toLowerCase().includes(term)
      );
    }

    setFilteredApps(filtered);
  }, [applications, statusFilter, searchTerm]);

  // ================= VIEW DETAIL =================
  const handleViewDetail = (app) => {
    setSelectedApp(app);
    setShowDetail(true);
  };

  // ================= APPROVE APPLICATION =================
  const handleApprove = async () => {
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/sellers/applications/${selectedApp._id}/approve`,
        { notes: approveNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`✅ ${selectedApp.businessName} approved and vendor account created!`);
      setShowApproveModal(false);
      setApproveNotes("");
      fetchApplications();
    } catch (err) {
      console.error("Approve error:", err);
      setError(err.response?.data?.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= REJECT APPLICATION =================
  const handleReject = async () => {
    if (!selectedApp) return;

    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/sellers/applications/${selectedApp._id}/reject`,
        { reason: rejectReason, notes: rejectNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`✅ ${selectedApp.businessName} rejected`);
      setShowRejectModal(false);
      setRejectReason("");
      setRejectNotes("");
      fetchApplications();
    } catch (err) {
      console.error("Reject error:", err);
      setError(err.response?.data?.message || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  // ================= GET STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge bg="warning" className="px-3 py-2">
            <FaClock className="me-1" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge bg="success" className="px-3 py-2">
            <FaCheckCircle className="me-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge bg="danger" className="px-3 py-2">
            <FaTimesCircle className="me-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // ================= STATS =================
  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <>
        <Header />
   
        <main className="admin-content mt-5">
          <Container>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading applications...</p>
            </div>
          </Container>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
     
      <main className="admin-content mt-5">
        <Container fluid>
          {/* Messages */}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <FaFileAlt className="me-2" />
              Seller Applications
              <Badge bg="secondary" className="ms-2">
                {filteredApps.length}
              </Badge>
            </h4>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h6 className="text-muted">Total</h6>
                  <h3>{stats.total}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm border-warning">
                <Card.Body>
                  <h6 className="text-muted">Pending</h6>
                  <h3 className="text-warning">{stats.pending}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm border-success">
                <Card.Body>
                  <h6 className="text-muted">Approved</h6>
                  <h3 className="text-success">{stats.approved}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm border-danger">
                <Card.Body>
                  <h6 className="text-muted">Rejected</h6>
                  <h3 className="text-danger">{stats.rejected}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Row className="mb-4">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search by name, email, business, or tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-100"
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table bordered hover className="applications-table">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tracking ID</th>
                  <th>Business Name</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <FaUsers size={40} className="mb-3" />
                      <p>No applications found</p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, index) => (
                    <tr key={app._id}>
                      <td>{index + 1}</td>
                      <td>
                        <code className="fw-bold">{app.trackingId}</code>
                      </td>
                      <td>
                        <FaStore className="me-2 text-primary" />
                        {app.businessName}
                      </td>
                      <td>{app.fullName}</td>
                      <td>
                        <FaEnvelope className="me-1 text-muted" />
                        {app.email}
                      </td>
                      <td>
                        <Badge bg="info">{app.category}</Badge>
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        {app.registeredAt
                          ? new Date(app.registeredAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => handleViewDetail(app)}
                        >
                          <FaEye />
                        </Button>
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="me-1"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowApproveModal(true);
                              }}
                            >
                              <FaCheck />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setSelectedApp(app);
                                setShowRejectModal(true);
                              }}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                        {app.status !== "pending" && (
                          <Badge bg="secondary">Reviewed</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Container>
      </main>

      {/* ================= DETAIL MODAL ================= */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileAlt className="me-2" />
            Application Details
          </Modal.Title>
        </Modal.Header>
        {selectedApp && (
          <Modal.Body>
            <Row>
              <Col md={6}>
                <div className="detail-item">
                  <label>Tracking ID</label>
                  <p>
                    <code className="fw-bold">{selectedApp.trackingId}</code>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{selectedApp.fullName}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>
                    <FaEnvelope className="me-1 text-muted" />
                    {selectedApp.email}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p>
                    <FaPhone className="me-1 text-muted" />
                    {selectedApp.phoneNumber || "N/A"}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label>Business Name</label>
                  <p>
                    <FaStore className="me-1 text-primary" />
                    {selectedApp.businessName}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <p>
                    <Badge bg="info">{selectedApp.category}</Badge>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>{getStatusBadge(selectedApp.status)}</p>
                </div>
                <div className="detail-item">
                  <label>Registered On</label>
                  <p>
                    <FaCalendarAlt className="me-1 text-muted" />
                    {new Date(selectedApp.registeredAt).toLocaleString()}
                  </p>
                </div>
              </Col>
            </Row>

            {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
              <Alert variant="danger" className="mt-3">
                <h6>📝 Rejection Reason</h6>
                <p className="mb-0">{selectedApp.rejectionReason}</p>
              </Alert>
            )}

            {selectedApp.adminNotes && (
              <Alert variant="info" className="mt-3">
                <h6>📌 Admin Notes</h6>
                <p className="mb-0">{selectedApp.adminNotes}</p>
              </Alert>
            )}

            {selectedApp.status === "approved" && selectedApp.vendorId && (
              <Alert variant="success" className="mt-3">
                <h6>🏪 Vendor Account Created</h6>
                <p className="mb-0">
                  <strong>Vendor ID:</strong> {selectedApp.vendorId}
                </p>
              </Alert>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= APPROVE MODAL ================= */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheckCircle className="me-2 text-success" />
            Approve Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <>
              <p>
                <strong>Business:</strong> {selectedApp.businessName}
              </p>
              <p>
                <strong>Applicant:</strong> {selectedApp.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedApp.email}
              </p>
              <Form.Group className="mt-3">
                <Form.Label>Admin Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add any notes for this approval..."
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                />
              </Form.Group>
              <Alert variant="success" className="mt-3">
                <strong>This will:</strong>
                <ul className="mb-0 mt-1">
                  <li>✅ Approve the application</li>
                  <li>✅ Create a vendor account</li>
                  <li>✅ Send login credentials to the applicant</li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              <FaCheck className="me-2" />
            )}
            Approve & Create Account
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================= REJECT MODAL ================= */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTimesCircle className="me-2 text-danger" />
            Reject Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <>
              <p>
                <strong>Business:</strong> {selectedApp.businessName}
              </p>
              <p>
                <strong>Applicant:</strong> {selectedApp.fullName}
              </p>
              <Form.Group className="mt-3">
                <Form.Label>
                  Rejection Reason <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Additional Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Add any additional notes..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              <FaTimes className="me-2" />
            )}
            Reject Application
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SellerApplications;