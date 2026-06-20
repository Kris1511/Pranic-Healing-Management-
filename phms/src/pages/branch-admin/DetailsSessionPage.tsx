import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  arrowBackOutline,
  calendarOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  personOutline,
  medkitOutline,
  starOutline,
  star,
  alertCircleOutline,
  cashOutline,
  chatbubbleEllipsesOutline,
  pulseOutline,
} from "ionicons/icons";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ROUTES } from "../../constants/routes.constant";
import { getSessionById } from "../../api/session.api";
import "./branch-admin.css";

export interface HealingSession {
  id: string | number;
  sessionNo: string;
  date: string;
  startTime: string;
  endTime: string;
  patient: string;
  healer: string;
  type: string;
  status: "Completed" | "Scheduled" | "Cancelled";
  paymentStatus: "Paid" | "Pending";
  paymentMethod?: "Cash" | "UPI";
  sessionFee?: string | number;
  followUp: {
    required: boolean;
    urgency: "Urgent" | "Pending" | "None";
  };
  notes?: {
    treatmentType: string;
    observations: string;
    detailedNotes: string;
    recommendation: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
}

const DetialsSessionsPages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<{ fromPatientId?: string; fromFinance?: boolean }>();
  const { user } = useAuthStore();
  const [session, setSession] = useState<HealingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fromPatientId = location.state?.fromPatientId;
  const fromFinance = location.state?.fromFinance;

  const rawRole = user?.role || "BRANCH_ADMIN";

  const fetchSessionDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    try {
      const response = await getSessionById(id);
      console.log("Backend response for session details:", response);
      if (response.success && response.data) {
        const s = response.data;
        const todayStr = new Date().toISOString().split("T")[0];
        setSession({
          id: s.id,
          sessionNo: `S-${String(s.id).padStart(4, "0")}`,
          date: s.session_date ? s.session_date.split("T")[0] : todayStr,
          startTime: s.start_time || "10:00 AM",
          endTime: s.end_time || "11:00 AM",
          patient: s.patient_name || "Unknown Patient",
          healer: s.healer_name || "Unknown Healer",
          type: s.treatment_type || "Pranic Healing",
          status:
            s.status === "scheduled"
              ? "Scheduled"
              : s.status === "completed"
                ? "Completed"
                : s.status === "cancelled"
                  ? "Cancelled"
                  : s.status || "Scheduled",
          paymentStatus: s.payment_status || "Pending",
          paymentMethod: s.payment_method || "Cash",
          sessionFee: s.session_fee !== undefined && s.session_fee !== null ? s.session_fee : s.total_amount,
          followUp: {
            required: !!s.followup_required,
            urgency: s.followup_priority || "None",
          },
          notes: s.notes
            ? {
                detailedNotes: s.notes,
                treatmentType: s.treatment_type || "",
                observations: "",
                recommendation: "",
              }
            : undefined,
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch session details from backend:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch once on mount / when id changes
  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  // Re-fetch every time this Ionic page becomes visible (e.g. navigating back from edit)
  useIonViewWillEnter(() => {
    fetchSessionDetails();
  });

  if (loading) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content">
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <IonSpinner name="crescent" style={{ width: "48px", height: "48px", color: "#0f5b4b" }} />
            <p style={{ marginTop: "16px", color: "#64748b", fontSize: "15px" }}>Loading session details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (notFound || !session) {
    return (
      <IonPage className="sa-page">
        <IonContent className="sa-page__content">
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <IonIcon
              icon={alertCircleOutline}
              style={{ fontSize: "64px", color: "#e11d48" }}
            />
            <h2>Session Not Found</h2>
            <p>
              The requested healing session ID does not exist or has been
              deleted.
            </p>
            <button
              className="sa-btn sa-btn--primary"
              onClick={() => {
                if (fromFinance) {
                  history.push(ROUTES.BRANCH_ADMIN.FINANCE);
                } else if (fromPatientId) {
                  history.push(`${ROUTES.BRANCH_ADMIN.PATIENT_DETAILS.replace(':id', encodeURIComponent(fromPatientId))}?tab=financials`);
                } else {
                  history.push(ROUTES.BRANCH_ADMIN.SESSIONS);
                }
              }}
            >
              {fromFinance ? "Return to Finance Ledger" : fromPatientId ? "Return to Patient Details" : "Return to Sessions Registry"}
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "sa-badge--active"; // Green
      case "scheduled":
        return "sa-badge--pending"; // Orange
      case "cancelled":
        return "sa-badge--inactive"; // Red
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return checkmarkCircleOutline;
      case "scheduled":
        return timeOutline;
      case "cancelled":
        return closeCircleOutline;
      default:
        return timeOutline;
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "st-panel-badge--green";
      case "pending":
        return "sa-badge--inactive";
      default:
        return "";
    }
  };

  return (
    <IonPage className="sa-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="sa-page__toolbar">
          <IonButtons slot="start">
            <button
              className="sa-btn sa-btn--icon-only"
              onClick={() => {
                if (fromFinance) {
                  history.push(ROUTES.BRANCH_ADMIN.FINANCE);
                } else if (fromPatientId) {
                  history.goBack();
                } else {
                  history.push(ROUTES.BRANCH_ADMIN.SESSIONS);
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#1e293b",
                fontSize: "20px",
                padding: "8px",
              }}
            >
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="sa-page__toolbar-title">
            Healing Session Details
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sa-page__content">
        <div
          className="sa-page__body"
          style={{ margin: "0 auto", padding: "24px 16px" }}
        >
          {/* Session Header Card */}
          <div
            className="sa-section"
            style={{
              background: "linear-gradient(135deg, #0f5b4b 0%, #1c7e6c 100%)",
              color: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(15, 91, 75, 0.3)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    opacity: 0.8,
                    fontWeight: 700,
                  }}
                >
                  Healing Session Registry File
                </span>
                <h1
                  style={{
                    color: "white",
                    margin: "4px 0 8px 0",
                    fontSize: "32px",
                    fontWeight: 800,
                  }}
                >
                  {session.sessionNo}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    opacity: 0.9,
                    fontWeight: 500,
                  }}
                >
                  {session.type}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                <span
                  className={`sa-badge ${getStatusBadgeClass(session.status)}`}
                  style={{
                    fontSize: "13px",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    gap: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <IonIcon icon={getStatusIcon(session.status)} />
                  <strong>{session.status}</strong>
                </span>
                {session.followUp?.urgency === "Urgent" && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    🔴 URGENT FOLLOW-UP REQUIRED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Column 1: Patient and Healer Registry Details */}
            <div
              className="sa-section"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#334155",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "10px",
                }}
              >
                Assignment &amp; Schedule
              </h3>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  className="sa-table__avatar sa-table__avatar--primary"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                  }}
                >
                  {session.patient
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    PATIENT NAME
                  </div>
                  <strong style={{ fontSize: "15px", color: "#1e293b" }}>
                    {session.patient}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#e0f2fe",
                    color: "#0369a1",
                  }}
                >
                  <IonIcon icon={personOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    ASSIGNED HEALER
                  </div>
                  <strong style={{ fontSize: "15px", color: "#1e293b" }}>
                    {session.healer}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#fef3c7",
                    color: "#d97706",
                  }}
                >
                  <IonIcon icon={calendarOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    DATE &amp; TIME SLOT
                  </div>
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                    {session.date}
                  </strong>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Account and Logistics Details */}
            <div
              className="sa-section"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#334155",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "10px",
                }}
              >
                Finance &amp; Logistics
              </h3>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#ecfdf5",
                    color: "#047857",
                  }}
                >
                  <IonIcon icon={cashOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    PAYMENT STATUS
                  </div>
                  <span
                    className={`st-panel-badge ${getPaymentBadgeClass(session.paymentStatus)}`}
                    style={{
                      display: "inline-block",
                      marginTop: "4px",
                      fontSize: "14px",
                      padding: "4px 10px",
                      color:
                        session.paymentStatus === "Paid"
                          ? "#16a34a"
                          : session.paymentStatus === "Pending"
                            ? "#f59e0b"
                            : "#ef4444",
                      background: "transparent",
                    }}
                  >
                    {session.paymentStatus}
                  </span>
                  {/* <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                    {session.paymentStatus || '—'}
                  </strong> */}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#ecfdf5",
                    color: "#047857",
                  }}
                >
                  <IonIcon icon={cashOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    SESSION FEE
                  </div>
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                    {session.sessionFee !== undefined && session.sessionFee !== null
                      ? `₹${parseFloat(session.sessionFee.toString()).toLocaleString('en-IN')}`
                      : "—"}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#e0f2fe",
                    color: "#0284c7",
                  }}
                >
                  <IonIcon icon={cashOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    PAYMENT METHOD
                  </div>
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                    {/* {session.paymentStatus === 'Paid' ? (session.paymentMethod || 'UPI') : '—'} */}
                    {session.paymentMethod || "—"}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  <IonIcon icon={alertCircleOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    FOLLOW-UP STATUS
                  </div>
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>
                    {session.followUp?.required
                      ? `Yes (${session.followUp.urgency} Urgency)`
                      : "No Follow-up Scheduled"}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "4px",
                }}
              >
                <div
                  className="sa-table__avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                >
                  <IonIcon icon={pulseOutline} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    COMPLETION STATUS
                  </div>
                  <strong
                    style={{
                      fontSize: "14px",
                      color:
                        session.status === "Completed" ? "#16a34a" : "#d97706",
                    }}
                  >
                    {session.status === "Completed"
                      ? "✓ Fully Completed"
                      : "⚠ Active & Scheduled"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Sections based on Session status */}
          {session.status === "Completed" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* SECTION: Clinical Healing Records */}
              <div
                className="sa-section"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #a7f3d0",
                  background: "#f0fdf4",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid #d1fae5",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <IonIcon
                    icon={pulseOutline}
                    style={{ fontSize: "20px", color: "#0f766e" }}
                  />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f766e",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Clinical Healing Records
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#0f766e",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Chakra Observations
                    </div>
                    <div
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#334155",
                        lineHeight: "1.5",
                        fontWeight: 500,
                      }}
                    >
                      {session.notes?.observations ||
                        "No chakra observations recorded."}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#0f766e",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Detailed Clinical Notes
                    </div>
                    <div
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#334155",
                        lineHeight: "1.5",
                        fontWeight: 500,
                      }}
                    >
                      {session.notes?.detailedNotes ||
                        "No detailed clinical notes recorded."}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#0f766e",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Clinical Recommendations
                    </div>
                    <div
                      style={{
                        background: "#e6fffa",
                        border: "1px solid #99f6e4",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0d9488",
                        lineHeight: "1.5",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IonIcon
                        icon={medkitOutline}
                        style={{ fontSize: "16px" }}
                      />
                      {session.notes?.recommendation ||
                        "No clinical recommendations logged."}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Patient Feedback Summary */}
              <div
                className="sa-section"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e9d5ff",
                  background: "#faf5ff",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid #f3e8ff",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <IonIcon
                    icon={chatbubbleEllipsesOutline}
                    style={{ fontSize: "20px", color: "#6b21a8" }}
                  />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#6b21a8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Patient Feedback &amp; Review
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#6b21a8",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Feedback Summary (Rating)
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        fontSize: "24px",
                        color: "#f59e0b",
                        marginTop: "4px",
                      }}
                    >
                      {session.feedback ? (
                        [1, 2, 3, 4, 5].map((starVal) => (
                          <IonIcon
                            key={starVal}
                            icon={
                              starVal <= session.feedback!.rating
                                ? star
                                : starOutline
                            }
                          />
                        ))
                      ) : (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          No rating submitted
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        color: "#6b21a8",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      Feedback Comments
                    </div>
                    <div
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#581c87",
                        fontStyle: "italic",
                        lineHeight: "1.5",
                        fontWeight: 500,
                      }}
                    >
                      {session.feedback?.comment
                        ? `"${session.feedback.comment}"`
                        : "No verbal comments recorded by patient."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SECTION: Non-completed sessions only show basic details message */
            <div
              className="sa-section"
              style={{
                borderRadius: "12px",
                border: "1px solid #fed7aa",
                background: "#fff7ed",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <IonIcon
                icon={alertCircleOutline}
                style={{
                  fontSize: "36px",
                  color: "#ea580c",
                  marginBottom: "8px",
                }}
              />
              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ea580c",
                }}
              >
                Pending Session Completion
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#7c2d12",
                  fontWeight: 500,
                  lineHeight: "1.5",
                }}
              >
                This session status is currently{" "}
                <strong>{session.status}</strong>. Clinical healing notes,
                chakra observations, recommendations, and patient feedback
                ratings will populate dynamically once the assigned healer
                conducts and submits the completed session.
              </p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetialsSessionsPages;
