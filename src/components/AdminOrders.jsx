import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================
  // ALLOWED ORDER STATUSES
  // =========================================

  const statuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // =========================================
  // FETCH ALL ORDERS
  // =========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("qaverin-token");

        if (!token) {
          setError("Authentication token not found.");
          setLoading(false);
          return;
        }

        const response = await fetch(
         `${API_URL}/api/admin/orders`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to fetch orders.");
          setLoading(false);
          return;
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch (error) {
        console.error("Fetch admin orders error:", error);

        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // =========================================
  // UPDATE ORDER STATUS
  // =========================================

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("qaverin-token");

      if (!token) {
        setError("Authentication token not found.");
        setUpdatingOrderId(null);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update order status."
        );

        setUpdatingOrderId(null);
        return;
      }

      // =========================================
      // UPDATE LOCAL ORDER
      // =========================================

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSuccessMessage(
        `Order #${orderId} updated to ${newStatus}.`
      );
    } catch (error) {
      console.error("Update status error:", error);

      setError("Unable to connect to the server.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "80vh",
          padding: "60px 8%",
          background: "#f7f4ef",
          color: "#171513",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#9b7540",
          }}
        >
          QAVERIN · ADMIN · ORDERS
        </p>

        <h1
          style={{
            marginTop: "15px",
            fontFamily: "Georgia, serif",
            fontSize: "48px",
            fontWeight: "400",
          }}
        >
          Loading <em>orders.</em>
        </h1>
      </main>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <main
      style={{
        minHeight: "80vh",
        padding: "60px 8%",
        background: "#f7f4ef",
        color: "#171513",
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <section>
        <p
          style={{
            margin: 0,
            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#9b7540",
          }}
        >
          QAVERIN · ADMIN · ORDERS
        </p>

        <h1
          style={{
            margin: "15px 0",
            fontFamily: "Georgia, serif",
            fontSize: "52px",
            fontWeight: "400",
          }}
        >
          Customer <em>Orders.</em>
        </h1>

        <p
          style={{
            fontFamily: "Arial, sans-serif",
            color: "#6f6962",
          }}
        >
          View and manage customer orders.
        </p>

        <Link
          to="/admin"
          style={{
            display: "inline-block",
            marginTop: "30px",
            color: "#171513",
            textDecoration: "none",
            fontFamily: "Arial, sans-serif",
            fontSize: "11px",
            letterSpacing: "2px",
          }}
        >
          ← BACK TO ADMIN
        </Link>
      </section>

      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (
        <div
          style={{
            marginTop: "30px",
            padding: "15px 20px",
            background: "#fff0ed",
            border: "1px solid #d9aaa0",
            color: "#8b3a2f",
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px 20px",
            background: "#edf7ef",
            border: "1px solid #a9c9ad",
            color: "#38613d",
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* =====================================
          ORDER COUNT
      ===================================== */}

      <p
        style={{
          marginTop: "50px",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          letterSpacing: "3px",
          color: "#9b7540",
        }}
      >
        {orders.length}{" "}
        {orders.length === 1 ? "ORDER" : "ORDERS"}
      </p>

      {/* =====================================
          NO ORDERS
      ===================================== */}

      {orders.length === 0 ? (
        <section
          style={{
            marginTop: "25px",
            padding: "60px 30px",
            background: "#ffffff",
            border: "1px solid #ded8d0",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "Georgia, serif",
              fontWeight: "400",
              fontSize: "30px",
            }}
          >
            No orders found.
          </h2>

          <p
            style={{
              marginTop: "12px",
              color: "#6f6962",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Customer orders will appear here.
          </p>
        </section>
      ) : (
        /* =====================================
           ORDERS
        ===================================== */

        <section
          style={{
            display: "grid",
            gap: "25px",
            marginTop: "25px",
          }}
        >
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                background: "#ffffff",
                border: "1px solid #ded8d0",
              }}
            >
              {/* =================================
                  ORDER HEADER
              ================================= */}

              <div
                style={{
                  padding: "30px 36px",
                  borderBottom: "1px solid #ded8d0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      letterSpacing: "3px",
                      color: "#9b7540",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    ORDER
                  </p>

                  <h2
                    style={{
                      margin: "8px 0 0",
                      fontFamily: "Georgia, serif",
                      fontSize: "30px",
                      fontWeight: "400",
                    }}
                  >
                    #{order.id}
                  </h2>

                  {/* VIEW DETAILS */}

                  <Link
                    to={`/admin/orders/${order.id}`}
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      color: "#9b7540",
                      textDecoration: "none",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "10px",
                      letterSpacing: "2px",
                    }}
                  >
                    VIEW DETAILS →
                  </Link>
                </div>

                {/* =================================
                    STATUS
                ================================= */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "9px",
                      letterSpacing: "2px",
                      color: "#6f6962",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    ORDER STATUS
                  </label>

                  <select
                    value={order.status || "Pending"}
                    disabled={
                      updatingOrderId === order.id
                    }
                    onChange={(event) =>
                      updateStatus(
                        order.id,
                        event.target.value
                      )
                    }
                    style={{
                      minWidth: "190px",
                      padding: "12px 14px",
                      border: "1px solid #d8c5aa",
                      background: "#f7f4ef",
                      color: "#171513",
                      fontSize: "12px",
                      cursor:
                        updatingOrderId === order.id
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        updatingOrderId === order.id
                          ? 0.6
                          : 1,
                    }}
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                  {updatingOrderId === order.id && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "10px",
                        color: "#9b7540",
                      }}
                    >
                      Updating...
                    </p>
                  )}
                </div>
              </div>

              {/* =================================
                  CUSTOMER
              ================================= */}

              <div
                style={{
                  padding: "30px 36px",
                  borderBottom: "1px solid #ded8d0",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "10px",
                    letterSpacing: "3px",
                    color: "#9b7540",
                  }}
                >
                  CUSTOMER
                </p>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "Georgia, serif",
                    fontSize: "24px",
                    fontWeight: "400",
                  }}
                >
                  {order.customer_name ||
                    order.customerName ||
                    "Customer"}
                </h3>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#6f6962",
                  }}
                >
                  {order.email || "No email available"}
                </p>

                <p
                  style={{
                    margin: "5px 0",
                    color: "#6f6962",
                  }}
                >
                  {order.phone || "No phone available"}
                </p>

                {(order.address ||
                  order.city ||
                  order.state ||
                  order.pincode) && (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#6f6962",
                      lineHeight: "1.6",
                    }}
                  >
                    {order.address}
                    <br />

                    {order.city}
                    {order.city && order.state
                      ? ", "
                      : ""}
                    {order.state} {order.pincode}
                  </p>
                )}
              </div>

              {/* =================================
                  ORDER ITEMS
              ================================= */}

              <div
                style={{
                  padding: "30px 36px",
                  borderBottom: "1px solid #ded8d0",
                }}
              >
                <p
                  style={{
                    margin: "0 0 20px",
                    fontSize: "10px",
                    letterSpacing: "3px",
                    color: "#9b7540",
                  }}
                >
                  ORDER ITEMS
                </p>

                {Array.isArray(order.items) &&
                order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        padding: "15px 0",
                        borderBottom:
                          "1px solid #eee9e2",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontFamily: "Georgia, serif",
                            fontSize: "18px",
                            fontWeight: "400",
                          }}
                        >
                          {item.name || "Product"}
                        </strong>

                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#6f6962",
                            fontSize: "13px",
                          }}
                        >
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "nowrap",
                          fontFamily: "Georgia, serif",
                        }}
                      >
                        ₹
                        {Number(
                          item.price || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      margin: 0,
                      color: "#6f6962",
                    }}
                  >
                    No order items available.
                  </p>
                )}
              </div>

              {/* =================================
                  ORDER TOTAL
              ================================= */}

              <div
                style={{
                  padding: "25px 36px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "#9b7540",
                    }}
                  >
                    PAYMENT
                  </p>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#6f6962",
                    }}
                  >
                    {order.payment_method ||
                      order.paymentMethod ||
                      "COD"}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "#9b7540",
                    }}
                  >
                    TOTAL
                  </p>

                  <h3
                    style={{
                      margin: "5px 0 0",
                      fontFamily: "Georgia, serif",
                      fontSize: "28px",
                      fontWeight: "400",
                    }}
                  >
                    ₹
                    {Number(
                      order.total_amount ||
                        order.totalAmount ||
                        0
                    ).toFixed(2)}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminOrders;