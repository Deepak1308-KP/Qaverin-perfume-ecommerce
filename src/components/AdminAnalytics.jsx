import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

function AdminAnalytics() {
  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";

  /* =========================================
     CURRENT USER
  ========================================= */

  const userData =
    localStorage.getItem("qaverin-current-user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error(
      "Unable to read current user:",
      error
    );
  }

  /* =========================================
     STATE
  ========================================= */

  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================
     SAFE NUMBER HELPER
  ========================================= */

  const safeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  /* =========================================
     LOAD ANALYTICS
  ========================================= */

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (user?.role !== "admin") {
      return;
    }

    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        /* =====================================
           TOKEN
        ===================================== */

        const token =
          localStorage.getItem("qaverin-token");

        if (!token) {
          setError(
            "Login token not found."
          );

          setLoading(false);

          return;
        }

        /* =====================================
           FETCH DASHBOARD STATISTICS
        ===================================== */

        const statsResponse = await fetch(
          "http://127.0.0.1:5000/api/admin/dashboard-stats",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const statsData =
          await statsResponse.json();

        if (cancelled) {
          return;
        }

        if (!statsResponse.ok) {
          setError(
            statsData.message ||
              "Unable to fetch analytics."
          );

          setLoading(false);

          return;
        }

        /* =====================================
           IMPORTANT FIX

           Backend returns:

           {
             message: "...",
             stats: {
               orders: 4,
               products: 1,
               customers: 5,
               revenue: 11996
             }
           }

           Therefore we must read
           statsData.stats.
        ===================================== */

        const dashboardStats =
          statsData.stats || statsData || {};

        /* =====================================
           ORDERS
        ===================================== */

        let totalOrders = 0;

        if (
          Number.isFinite(
            Number(
              dashboardStats.orders
            )
          )
        ) {
          totalOrders =
            Number(
              dashboardStats.orders
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.total_orders
            )
          )
        ) {
          totalOrders =
            Number(
              dashboardStats.total_orders
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.order_count
            )
          )
        ) {
          totalOrders =
            Number(
              dashboardStats.order_count
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.orders_count
            )
          )
        ) {
          totalOrders =
            Number(
              dashboardStats.orders_count
            );
        }

        /* =====================================
           PRODUCTS
        ===================================== */

        let totalProducts = 0;

        if (
          Number.isFinite(
            Number(
              dashboardStats.products
            )
          )
        ) {
          totalProducts =
            Number(
              dashboardStats.products
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.total_products
            )
          )
        ) {
          totalProducts =
            Number(
              dashboardStats.total_products
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.products_count
            )
          )
        ) {
          totalProducts =
            Number(
              dashboardStats.products_count
            );
        }

        /* =====================================
           CUSTOMERS
        ===================================== */

        let totalCustomers = 0;

        if (
          Number.isFinite(
            Number(
              dashboardStats.customers
            )
          )
        ) {
          totalCustomers =
            Number(
              dashboardStats.customers
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.total_customers
            )
          )
        ) {
          totalCustomers =
            Number(
              dashboardStats.total_customers
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.customers_count
            )
          )
        ) {
          totalCustomers =
            Number(
              dashboardStats.customers_count
            );
        }

        /* =====================================
           REVENUE
        ===================================== */

        let totalRevenue = 0;

        if (
          Number.isFinite(
            Number(
              dashboardStats.revenue
            )
          )
        ) {
          totalRevenue =
            Number(
              dashboardStats.revenue
            );
        } else if (
          Number.isFinite(
            Number(
              dashboardStats.total_revenue
            )
          )
        ) {
          totalRevenue =
            Number(
              dashboardStats.total_revenue
            );
        }

        /* =====================================
           SAVE STATISTICS
        ===================================== */

        setStats({
          orders: totalOrders,
          products: totalProducts,
          customers: totalCustomers,
          revenue: totalRevenue,
        });

        /* =====================================
           FETCH ADMIN ORDERS
        ===================================== */

        const ordersResponse =
          await fetch(
            "http://127.0.0.1:5000/api/admin/orders",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const ordersData =
          await ordersResponse.json();

        if (cancelled) {
          return;
        }

        if (
          ordersResponse.ok &&
          Array.isArray(
            ordersData.orders
          )
        ) {
          setOrders(
            ordersData.orders
          );

          /* =================================
             BACKUP ORDER COUNT

             If dashboard statistics
             doesn't contain the order
             count, use orders array.
          ================================= */

          if (totalOrders === 0) {
            setStats(
              (previous) => ({
                ...previous,

                orders:
                  ordersData.orders.length,
              })
            );
          }
        } else {
          setOrders([]);
        }

      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Analytics loading error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };

  }, [isLoggedIn, user?.role]);

  /* =========================================
     PROTECT ADMIN PAGE
  ========================================= */

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================
     ORDER STATUS COUNTS
  ========================================= */

  const pendingOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() === "pending"
    ).length;

  const confirmedOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() === "confirmed"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() === "shipped"
    ).length;

  const outForDeliveryOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() ===
        "out for delivery"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() === "delivered"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        String(order.status || "")
          .toLowerCase()
          .trim() === "cancelled"
    ).length;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main style={pageStyle}>

        <p style={labelStyle}>
          QAVERIN · ADMIN · ANALYTICS
        </p>

        <h1 style={titleStyle}>
          Loading <em>analytics.</em>
        </h1>

      </main>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <main style={pageStyle}>

      {/* =====================================
          HEADER
      ===================================== */}

      <section>

        <p style={labelStyle}>
          QAVERIN · ADMIN · ANALYTICS
        </p>

        <h1 style={titleStyle}>
          Sales <em>analytics.</em>
        </h1>

        <p style={descriptionStyle}>
          View your store performance,
          revenue and sales activity.
        </p>

        <Link
          to="/admin"
          style={backLinkStyle}
        >
          ← BACK TO ADMIN
        </Link>

      </section>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}


      {/* =====================================
          OVERVIEW
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >

        <p style={labelStyle}>
          OVERVIEW
        </p>

        <h2 style={sectionTitleStyle}>
          Store <em>performance.</em>
        </h2>

        <div style={gridStyle}>

          {/* ORDERS */}

          <div style={cardStyle}>

            <p style={cardLabelStyle}>
              ORDERS
            </p>

            <h3 style={numberStyle}>
              {stats.orders}
            </h3>

            <p style={smallTextStyle}>
              Total customer orders
            </p>

          </div>


          {/* PRODUCTS */}

          <div style={cardStyle}>

            <p style={cardLabelStyle}>
              PRODUCTS
            </p>

            <h3 style={numberStyle}>
              {stats.products}
            </h3>

            <p style={smallTextStyle}>
              Products in collection
            </p>

          </div>


          {/* CUSTOMERS */}

          <div style={cardStyle}>

            <p style={cardLabelStyle}>
              CUSTOMERS
            </p>

            <h3 style={numberStyle}>
              {stats.customers}
            </h3>

            <p style={smallTextStyle}>
              Registered customers
            </p>

          </div>


          {/* REVENUE */}

          <div style={cardStyle}>

            <p style={cardLabelStyle}>
              REVENUE
            </p>

            <h3 style={numberStyle}>
              ₹
              {safeNumber(
                stats.revenue
              ).toFixed(2)}
            </h3>

            <p style={smallTextStyle}>
              Total store revenue
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          ORDER STATUS
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >

        <p style={labelStyle}>
          ORDER STATUS
        </p>

        <h2 style={sectionTitleStyle}>
          Orders by <em>status.</em>
        </h2>

        <div style={statusGridStyle}>

          {/* PENDING */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              PENDING
            </p>

            <h3 style={statusNumberStyle}>
              {pendingOrders}
            </h3>

          </div>


          {/* CONFIRMED */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              CONFIRMED
            </p>

            <h3 style={statusNumberStyle}>
              {confirmedOrders}
            </h3>

          </div>


          {/* SHIPPED */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              SHIPPED
            </p>

            <h3 style={statusNumberStyle}>
              {shippedOrders}
            </h3>

          </div>


          {/* OUT FOR DELIVERY */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              OUT FOR DELIVERY
            </p>

            <h3 style={statusNumberStyle}>
              {outForDeliveryOrders}
            </h3>

          </div>


          {/* DELIVERED */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              DELIVERED
            </p>

            <h3 style={statusNumberStyle}>
              {deliveredOrders}
            </h3>

          </div>


          {/* CANCELLED */}

          <div style={statusCardStyle}>

            <p style={cardLabelStyle}>
              CANCELLED
            </p>

            <h3 style={statusNumberStyle}>
              {cancelledOrders}
            </h3>

          </div>

        </div>

      </section>


      {/* =====================================
          RECENT ORDERS
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >

        <p style={labelStyle}>
          SALES
        </p>

        <h2 style={sectionTitleStyle}>
          Recent <em>orders.</em>
        </h2>


        {orders.length === 0 ? (

          <div style={emptyStyle}>

            <h3 style={emptyTitleStyle}>
              No orders found.
            </h3>

            <p style={smallTextStyle}>
              There are currently no
              customer orders to display.
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gap: "15px",
            }}
          >

            {orders
              .slice(0, 10)
              .map(
                (order, index) => (

                  <div
                    key={
                      order.id ||
                      index
                    }
                    style={
                      orderCardStyle
                    }
                  >

                    <div>

                      <p
                        style={
                          cardLabelStyle
                        }
                      >
                        ORDER
                      </p>

                      <h3
                        style={{
                          margin:
                            "5px 0",

                          fontFamily:
                            "Georgia, serif",

                          fontSize:
                            "22px",

                          fontWeight:
                            "400",
                        }}
                      >
                        #
                        {order.id ||
                          index + 1}
                      </h3>


                      <p
                        style={{
                          margin:
                            "6px 0 0",

                          color:
                            "#6f6962",

                          fontFamily:
                            "Arial, sans-serif",

                          fontSize:
                            "12px",
                        }}
                      >
                        {order.customer_name ||
                          order.email ||
                          "Customer"}
                      </p>


                      <p
                        style={{
                          margin:
                            "6px 0 0",

                          color:
                            "#9b7540",

                          fontFamily:
                            "Arial, sans-serif",

                          fontSize:
                            "10px",

                          letterSpacing:
                            "1px",
                        }}
                      >
                        {order.status ||
                          "Pending"}
                      </p>

                    </div>


                    <strong
                      style={{
                        fontFamily:
                          "Georgia, serif",

                        fontSize:
                          "20px",

                        fontWeight:
                          "400",
                      }}
                    >
                      ₹
                      {safeNumber(
                        order.total_amount ??
                          order.total ??
                          order.amount ??
                          0
                      ).toFixed(2)}
                    </strong>

                  </div>

                )
              )}

          </div>

        )}

      </section>


      {/* =====================================
          PERFORMANCE SUMMARY
      ===================================== */}

      <section
        style={{
          marginTop: "50px",

          padding: "30px",

          background: "#171513",

          color: "#ffffff",
        }}
      >

        <p
          style={{
            margin:
              "0 0 10px",

            fontFamily:
              "Arial, sans-serif",

            fontSize:
              "9px",

            letterSpacing:
              "3px",

            color:
              "#d1ad76",
          }}
        >
          PERFORMANCE SUMMARY
        </p>


        <h2
          style={{
            margin:
              "0 0 20px",

            fontFamily:
              "Georgia, serif",

            fontSize:
              "30px",

            fontWeight:
              "400",
          }}
        >
          Your store is being{" "}
          <em>tracked.</em>
        </h2>


        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",

            gap: "20px",
          }}
        >

          {/* AVERAGE ORDER VALUE */}

          <div>

            <p
              style={
                darkLabelStyle
              }
            >
              AVERAGE ORDER VALUE
            </p>

            <p
              style={
                darkNumberStyle
              }
            >
              ₹
              {stats.orders > 0
                ? (
                    safeNumber(
                      stats.revenue
                    ) /
                    stats.orders
                  ).toFixed(2)
                : "0.00"}
            </p>

          </div>


          {/* DELIVERY RATE */}

          <div>

            <p
              style={
                darkLabelStyle
              }
            >
              DELIVERY RATE
            </p>

            <p
              style={
                darkNumberStyle
              }
            >
              {stats.orders > 0
                ? (
                    (
                      deliveredOrders /
                      stats.orders
                    ) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </p>

          </div>


          {/* CANCEL RATE */}

          <div>

            <p
              style={
                darkLabelStyle
              }
            >
              CANCEL RATE
            </p>

            <p
              style={
                darkNumberStyle
              }
            >
              {stats.orders > 0
                ? (
                    (
                      cancelledOrders /
                      stats.orders
                    ) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}


/* =========================================
   PAGE STYLES
========================================= */

const pageStyle = {
  minHeight: "80vh",

  padding:
    "60px 8%",

  background:
    "#f7f4ef",

  color:
    "#171513",
};


/* =========================================
   LABEL
========================================= */

const labelStyle = {
  margin: 0,

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "10px",

  letterSpacing:
    "4px",

  color:
    "#9b7540",
};


/* =========================================
   TITLE
========================================= */

const titleStyle = {
  margin:
    "15px 0",

  fontFamily:
    "Georgia, serif",

  fontSize:
    "52px",

  fontWeight:
    "400",
};


/* =========================================
   DESCRIPTION
========================================= */

const descriptionStyle = {
  fontFamily:
    "Arial, sans-serif",

  color:
    "#6f6962",
};


/* =========================================
   BACK LINK
========================================= */

const backLinkStyle = {
  display:
    "inline-block",

  marginTop:
    "25px",

  color:
    "#171513",

  textDecoration:
    "none",

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "11px",

  letterSpacing:
    "1.5px",
};


/* =========================================
   SECTION TITLE
========================================= */

const sectionTitleStyle = {
  margin:
    "12px 0 25px",

  fontFamily:
    "Georgia, serif",

  fontSize:
    "32px",

  fontWeight:
    "400",
};


/* =========================================
   MAIN GRID
========================================= */

const gridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",

  gap:
    "20px",
};


/* =========================================
   MAIN CARD
========================================= */

const cardStyle = {
  padding:
    "30px",

  background:
    "#ffffff",

  border:
    "1px solid #ded8d0",
};


/* =========================================
   CARD LABEL
========================================= */

const cardLabelStyle = {
  margin: 0,

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "10px",

  letterSpacing:
    "2px",

  color:
    "#9b7540",
};


/* =========================================
   NUMBER
========================================= */

const numberStyle = {
  margin:
    "20px 0 5px",

  fontFamily:
    "Georgia, serif",

  fontSize:
    "32px",

  fontWeight:
    "400",
};


/* =========================================
   SMALL TEXT
========================================= */

const smallTextStyle = {
  margin: 0,

  color:
    "#6f6962",

  fontFamily:
    "Arial, sans-serif",
};


/* =========================================
   STATUS GRID
========================================= */

const statusGridStyle = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",

  gap:
    "15px",
};


/* =========================================
   STATUS CARD
========================================= */

const statusCardStyle = {
  padding:
    "25px",

  background:
    "#ffffff",

  border:
    "1px solid #ded8d0",
};


/* =========================================
   STATUS NUMBER
========================================= */

const statusNumberStyle = {
  margin:
    "15px 0 0",

  fontFamily:
    "Georgia, serif",

  fontSize:
    "30px",

  fontWeight:
    "400",
};


/* =========================================
   ORDER CARD
========================================= */

const orderCardStyle = {
  padding:
    "22px 25px",

  background:
    "#ffffff",

  border:
    "1px solid #ded8d0",

  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "center",

  gap:
    "20px",
};


/* =========================================
   EMPTY
========================================= */

const emptyStyle = {
  padding:
    "60px 30px",

  background:
    "#ffffff",

  border:
    "1px solid #ded8d0",

  textAlign:
    "center",
};


/* =========================================
   EMPTY TITLE
========================================= */

const emptyTitleStyle = {
  margin:
    "0 0 10px",

  fontFamily:
    "Georgia, serif",

  fontSize:
    "26px",

  fontWeight:
    "400",
};


/* =========================================
   ERROR
========================================= */

const errorStyle = {
  marginTop:
    "25px",

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
};


/* =========================================
   DARK LABEL
========================================= */

const darkLabelStyle = {
  margin:
    "0 0 8px",

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "9px",

  letterSpacing:
    "2px",

  color:
    "#d1ad76",
};


/* =========================================
   DARK NUMBER
========================================= */

const darkNumberStyle = {
  margin: 0,

  fontFamily:
    "Georgia, serif",

  fontSize:
    "25px",

  fontWeight:
    "400",
};


export default AdminAnalytics;