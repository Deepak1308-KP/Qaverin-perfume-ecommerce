import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================
  // ORDER STATUSES
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
  // FETCH ADMIN ORDER
  // =========================================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token =
          localStorage.getItem("qaverin-token");

        if (!token) {
          setError(
            "Authentication token not found."
          );
          setLoading(false);
          return;
        }

        /*
          IMPORTANT:

          Admin must use /api/admin/orders
          because /api/orders/:id is for
          the current customer only.
        */

        const response = await fetch(
          `${API_URL}/api/admin/orders`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to fetch orders."
          );
          setLoading(false);
          return;
        }

        const allOrders =
          Array.isArray(data.orders)
            ? data.orders
            : [];

        /*
          Find the selected order.

          URL id is a string.
          Database order.id may be a number.
        */

        const selectedOrder =
          allOrders.find(
            (item) =>
              String(item.id) === String(id)
          );

        if (!selectedOrder) {
          setError("Order not found.");
          setOrder(null);
        } else {
          setOrder(selectedOrder);
        }
      } catch (error) {
        console.error(
          "Fetch admin order error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // =========================================
  // UPDATE STATUS
  // =========================================

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      const token =
        localStorage.getItem(
          "qaverin-token"
        );

      if (!token) {
        setError(
          "Authentication token not found."
        );
        setUpdating(false);
        return;
      }

      const response = await fetch(
       `${API_URL}/api/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update order status."
        );
        setUpdating(false);
        return;
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        status: newStatus,
      }));

      setSuccessMessage(
        `Order #${id} updated to ${newStatus}.`
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return date;
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
            fontFamily:
              "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#9b7540",
          }}
        >
          QAVERIN · ADMIN · ORDER
        </p>

        <h1
          style={{
            marginTop: "15px",
            fontFamily:
              "Georgia, serif",
            fontSize: "48px",
            fontWeight: "400",
          }}
        >
          Loading <em>order.</em>
        </h1>
      </main>
    );
  }

  // =========================================
  // ORDER NOT FOUND
  // =========================================

  if (!order) {
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
            fontFamily:
              "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#9b7540",
          }}
        >
          QAVERIN · ADMIN · ORDER
        </p>

        <h1
          style={{
            marginTop: "15px",
            fontFamily:
              "Georgia, serif",
            fontSize: "48px",
            fontWeight: "400",
          }}
        >
          Order <em>not found.</em>
        </h1>

        <p
          style={{
            marginTop: "20px",
            color: "#8b3a2f",
            fontFamily:
              "Arial, sans-serif",
          }}
        >
          {error || "Order not found"}
        </p>

        <Link
          to="/admin/orders"
          style={{
            display:
              "inline-block",
            marginTop: "25px",
            padding:
              "14px 22px",
            background:
              "#171513",
            color:
              "#ffffff",
            textDecoration:
              "none",
            fontFamily:
              "Arial, sans-serif",
            fontSize:
              "10px",
            letterSpacing:
              "2px",
          }}
        >
          ← BACK TO ORDERS
        </Link>
      </main>
    );
  }

  // =========================================
  // ORDER DATA
  // =========================================

  const customerName =
    order.customer_name ||
    order.customerName ||
    "Customer";

  const email =
    order.email ||
    order.customer_email ||
    "No email available";

  const phone =
    order.phone ||
    order.customer_phone ||
    "No phone available";

  const paymentMethod =
    order.payment_method ||
    order.paymentMethod ||
    "COD";

  const totalAmount = Number(
    order.total_amount ||
      order.totalAmount ||
      0
  );

  const orderStatus =
    order.status || "Pending";

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const totalItems =
    items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 1),
      0
    );

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
            fontFamily:
              "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#9b7540",
          }}
        >
          QAVERIN · ADMIN · ORDER DETAILS
        </p>

        <h1
          style={{
            margin: "15px 0",
            fontFamily:
              "Georgia, serif",
            fontSize: "52px",
            fontWeight: "400",
          }}
        >
          Order <em>Details.</em>
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6f6962",
            fontFamily:
              "Arial, sans-serif",
          }}
        >
          Review and manage this customer order.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/orders")
          }
          style={{
            marginTop: "30px",
            padding:
              "13px 20px",
            border:
              "1px solid #171513",
            background:
              "transparent",
            color:
              "#171513",
            cursor:
              "pointer",
            fontFamily:
              "Arial, sans-serif",
            fontSize:
              "10px",
            letterSpacing:
              "2px",
          }}
        >
          ← BACK TO ORDERS
        </button>
      </section>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div
          style={{
            marginTop: "30px",
            padding:
              "15px 20px",
            background:
              "#fff0ed",
            border:
              "1px solid #d9aaa0",
            color:
              "#8b3a2f",
            fontFamily:
              "Arial, sans-serif",
            fontSize:
              "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================
          SUCCESS
      ===================================== */}

      {successMessage && (
        <div
          style={{
            marginTop: "20px",
            padding:
              "15px 20px",
            background:
              "#edf7ef",
            border:
              "1px solid #a9c9ad",
            color:
              "#38613d",
            fontFamily:
              "Arial, sans-serif",
            fontSize:
              "13px",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* =====================================
          ORDER SUMMARY
      ===================================== */}

      <section
        style={{
          marginTop: "40px",
          background:
            "#ffffff",
          border:
            "1px solid #ded8d0",
        }}
      >
        {/* ORDER HEADER */}

        <div
          style={{
            padding:
              "30px 36px",
            borderBottom:
              "1px solid #ded8d0",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap:
              "25px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize:
                  "10px",
                letterSpacing:
                  "3px",
                color:
                  "#9b7540",
              }}
            >
              ORDER
            </p>

            <h2
              style={{
                margin:
                  "8px 0 0",
                fontFamily:
                  "Georgia, serif",
                fontSize:
                  "36px",
                fontWeight:
                  "400",
              }}
            >
              #{order.id}
            </h2>

            <p
              style={{
                margin:
                  "8px 0 0",
                color:
                  "#6f6962",
                fontSize:
                  "13px",
              }}
            >
              {formatDate(
                order.created_at ||
                  order.createdAt
              )}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "8px",
                fontSize:
                  "9px",
                letterSpacing:
                  "2px",
                color:
                  "#6f6962",
              }}
            >
              ORDER STATUS
            </label>

            <select
              value={orderStatus}
              disabled={updating}
              onChange={(event) =>
                updateStatus(
                  event.target.value
                )
              }
              style={{
                minWidth:
                  "200px",
                padding:
                  "12px 14px",
                border:
                  "1px solid #d8c5aa",
                background:
                  "#f7f4ef",
                color:
                  "#171513",
                fontSize:
                  "12px",
                cursor:
                  updating
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  updating
                    ? 0.6
                    : 1,
              }}
            >
              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            {updating && (
              <p
                style={{
                  margin:
                    "8px 0 0",
                  fontSize:
                    "10px",
                  color:
                    "#9b7540",
                }}
              >
                Updating...
              </p>
            )}
          </div>
        </div>

        {/* =====================================
            CUSTOMER INFORMATION
        ===================================== */}

        <div
          style={{
            padding:
              "35px 36px",
            borderBottom:
              "1px solid #ded8d0",
          }}
        >
          <p
            style={{
              margin:
                "0 0 20px",
              fontSize:
                "10px",
              letterSpacing:
                "3px",
              color:
                "#9b7540",
            }}
          >
            CUSTOMER INFORMATION
          </p>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap:
                "25px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize:
                    "9px",
                  letterSpacing:
                    "2px",
                  color:
                    "#9b7540",
                }}
              >
                NAME
              </p>

              <p
                style={{
                  margin:
                    "8px 0 0",
                  fontFamily:
                    "Georgia, serif",
                  fontSize:
                    "20px",
                }}
              >
                {customerName}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize:
                    "9px",
                  letterSpacing:
                    "2px",
                  color:
                    "#9b7540",
                }}
              >
                EMAIL
              </p>

              <p
                style={{
                  margin:
                    "8px 0 0",
                  color:
                    "#6f6962",
                }}
              >
                {email}
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize:
                    "9px",
                  letterSpacing:
                    "2px",
                  color:
                    "#9b7540",
                }}
              >
                PHONE
              </p>

              <p
                style={{
                  margin:
                    "8px 0 0",
                  color:
                    "#6f6962",
                }}
              >
                {phone}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================
            DELIVERY ADDRESS
        ===================================== */}

        <div
          style={{
            padding:
              "35px 36px",
            borderBottom:
              "1px solid #ded8d0",
          }}
        >
          <p
            style={{
              margin:
                "0 0 20px",
              fontSize:
                "10px",
              letterSpacing:
                "3px",
              color:
                "#9b7540",
            }}
          >
            DELIVERY ADDRESS
          </p>

          <p
            style={{
              margin: 0,
              color:
                "#6f6962",
              lineHeight:
                "1.8",
            }}
          >
            {order.address ||
              "Address not available"}
            <br />

            {order.city || ""}

            {order.city &&
            order.state
              ? ", "
              : ""}

            {order.state || ""}

            {order.pincode
              ? ` ${order.pincode}`
              : ""}
          </p>
        </div>

        {/* =====================================
            ORDER ITEMS
        ===================================== */}

        <div
          style={{
            padding:
              "35px 36px",
            borderBottom:
              "1px solid #ded8d0",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                "20px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize:
                  "10px",
                letterSpacing:
                  "3px",
                color:
                  "#9b7540",
              }}
            >
              ORDER ITEMS
            </p>

            <span
              style={{
                fontSize:
                  "11px",
                color:
                  "#6f6962",
              }}
            >
              {totalItems}{" "}
              {totalItems === 1
                ? "ITEM"
                : "ITEMS"}
            </span>
          </div>

          {items.length > 0 ? (
            <div>
              {items.map(
                (item, index) => {
                  const quantity =
                    Number(
                      item.quantity || 1
                    );

                  const price =
                    Number(
                      item.price || 0
                    );

                  const itemTotal =
                    price * quantity;

                  return (
                    <div
                      key={
                        item.id ||
                        index
                      }
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "20px",
                        padding:
                          "20px 0",
                        borderBottom:
                          "1px solid #eee9e2",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontFamily:
                              "Georgia, serif",
                            fontSize:
                              "20px",
                            fontWeight:
                              "400",
                          }}
                        >
                          {item.name ||
                            "Product"}
                        </h3>

                        <p
                          style={{
                            margin:
                              "7px 0 0",
                            color:
                              "#6f6962",
                            fontSize:
                              "13px",
                          }}
                        >
                          Quantity:{" "}
                          {quantity}
                        </p>

                        <p
                          style={{
                            margin:
                              "4px 0 0",
                            color:
                              "#6f6962",
                            fontSize:
                              "13px",
                          }}
                        >
                          Price: ₹
                          {price.toFixed(
                            2
                          )}
                        </p>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontFamily:
                            "Georgia, serif",
                          fontSize:
                            "20px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        ₹
                        {itemTotal.toFixed(
                          2
                        )}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color:
                  "#6f6962",
              }}
            >
              No order items available.
            </p>
          )}
        </div>

        {/* =====================================
            PAYMENT + TOTAL
        ===================================== */}

        <div
          style={{
            padding:
              "30px 36px",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap:
              "30px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize:
                  "10px",
                letterSpacing:
                  "2px",
                color:
                  "#9b7540",
              }}
            >
              PAYMENT METHOD
            </p>

            <p
              style={{
                margin:
                  "8px 0 0",
                color:
                  "#6f6962",
                textTransform:
                  "capitalize",
              }}
            >
              {paymentMethod}
            </p>
          </div>

          <div
            style={{
              textAlign:
                "right",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize:
                  "10px",
                letterSpacing:
                  "2px",
                color:
                  "#9b7540",
              }}
            >
              ORDER TOTAL
            </p>

            <h2
              style={{
                margin:
                  "6px 0 0",
                fontFamily:
                  "Georgia, serif",
                fontSize:
                  "34px",
                fontWeight:
                  "400",
              }}
            >
              ₹
              {totalAmount.toFixed(
                2
              )}
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrderDetails;