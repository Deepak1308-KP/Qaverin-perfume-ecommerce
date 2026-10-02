import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

function AdminCustomers() {

  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem(
      "qaverin-logged-in"
    ) === "true";


  /* =========================================
     CURRENT USER
  ========================================= */

  const userData =
    localStorage.getItem(
      "qaverin-current-user"
    );

  let user = null;

  try {

    user = userData
      ? JSON.parse(userData)
      : null;

  } catch (error) {

    console.error(
      "Unable to read current user:",
      error
    );

  }


  /* =========================================
     STATE
  ========================================= */

  const [customers, setCustomers] =
    useState([]);

  const [adminCount, setAdminCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =========================================
     FETCH CUSTOMERS
  ========================================= */

  useEffect(() => {

    /*
      Do not call setState synchronously here.

      The page protection below already handles
      users who are not logged in or not admin.
    */

    if (
      !isLoggedIn ||
      user?.role !== "admin"
    ) {
      return;
    }


    let cancelled = false;


    const fetchCustomers = async () => {

      try {

        setError("");
        setSuccessMessage("");


        /* =====================================
           GET TOKEN
        ===================================== */

        const token =
          localStorage.getItem(
            "qaverin-token"
          );


        if (!token) {

          if (!cancelled) {

            setError(
              "Login token not found. Please login again."
            );

            setLoading(false);

          }

          return;

        }


        /* =====================================
           API REQUEST
        ===================================== */

        /* =====================================
           GET CUSTOMERS
        ===================================== */

        const customersResponse =
          await fetch(
            "http://127.0.0.1:5000/api/admin/customers",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const customersData =
          await customersResponse.json();


        if (cancelled) {
          return;
        }


        console.log(
          "Customers API response:",
          customersData
        );


        /* =====================================
           CUSTOMER API ERROR
        ===================================== */

        if (!customersResponse.ok) {

          setError(
            customersData.message ||
            "Unable to fetch customers."
          );

          setLoading(false);

          return;

        }


        let customerList = [];


        if (
          Array.isArray(
            customersData.customers
          )
        ) {

          customerList =
            customersData.customers;

        } else if (
          Array.isArray(
            customersData.users
          )
        ) {

          customerList =
            customersData.users;

        } else if (
          Array.isArray(
            customersData.data
          )
        ) {

          customerList =
            customersData.data;

        }


        setCustomers(
          customerList
        );


        /* =====================================
           GET ADMIN COUNT

           /api/admin/customers returns only
           users whose role is "customer".
           Therefore adminCount cannot be calculated
           from customers.length or customers.filter().
        ===================================== */

        const statsResponse =
          await fetch(
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


        console.log(
          "Dashboard stats API response:",
          statsData
        );


        if (statsResponse.ok) {

          const stats =
            statsData.stats || {};

          setAdminCount(
            Number(
              stats.admins ?? 0
            )
          );

        } else {

          /*
            If the stats request fails, keep the
            customer page working and show 0 only
            for the admin summary.
          */

          setAdminCount(0);

        }


        setLoading(false);

      } catch (error) {

        if (cancelled) {
          return;
        }


        console.error(
          "Customers fetch error:",
          error
        );


        setError(
          "Unable to connect to the server."
        );


        setLoading(false);

      }

    };


    fetchCustomers();


    return () => {

      cancelled = true;

    };

  }, [isLoggedIn, user?.role]);


  /* =========================================
     DELETE CUSTOMER
  ========================================= */

  const handleDeleteCustomer = async (
    customer
  ) => {

    if (!customer?.id) {

      setError(
        "Customer ID not found."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${customer.name || customer.email}"?`
      );


    if (!confirmed) {
      return;
    }


    setDeletingId(
      customer.id
    );

    setError("");
    setSuccessMessage("");


    try {

      /* =====================================
         TOKEN
      ===================================== */

      const token =
        localStorage.getItem(
          "qaverin-token"
        );


      if (!token) {

        setError(
          "Login token not found."
        );

        setDeletingId(null);

        return;

      }


      /* =====================================
         DELETE REQUEST
      ===================================== */

      const response =
        await fetch(
          `http://127.0.0.1:5000/api/admin/customers/${customer.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      /* =====================================
         DELETE ERROR
      ===================================== */

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to delete customer."
        );

        setDeletingId(null);

        return;

      }


      /* =====================================
         REMOVE CUSTOMER FROM SCREEN
      ===================================== */

      setCustomers(
        (previousCustomers) =>
          previousCustomers.filter(
            (item) =>
              item.id !==
              customer.id
          )
      );


      setSuccessMessage(
        "Customer deleted successfully."
      );


    } catch (error) {

      console.error(
        "Delete customer error:",
        error
      );


      setError(
        "Unable to connect to the server."
      );

    }


    setDeletingId(null);

  };


  /* =========================================
     PROTECT PAGE
  ========================================= */

  if (!isLoggedIn) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  /* =========================================
     ADMIN ONLY
  ========================================= */

  if (user?.role !== "admin") {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <main
        style={pageStyle}
      >

        <p
          style={labelStyle}
        >
          QAVERIN · ADMIN · CUSTOMERS
        </p>


        <h1
          style={titleStyle}
        >
          Loading <em>customers.</em>
        </h1>

      </main>

    );

  }


  /* =========================================
     MAIN PAGE
  ========================================= */

  return (

    <main
      style={pageStyle}
    >


      {/* =====================================
          HEADER
      ===================================== */}

      <section>

        <p
          style={labelStyle}
        >
          QAVERIN · ADMIN · CUSTOMERS
        </p>


        <h1
          style={titleStyle}
        >
          Manage <em>customers.</em>
        </h1>


        <p
          style={descriptionStyle}
        >
          View registered customers and
          their order information.
        </p>


        <Link
          to="/admin"
          style={backLinkStyle}
        >
          ← BACK TO ADMIN
        </Link>

      </section>


      {/* =====================================
          ERROR MESSAGE
      ===================================== */}

      {error && (

        <div
          style={errorStyle}
        >
          {error}
        </div>

      )}


      {/* =====================================
          SUCCESS MESSAGE
      ===================================== */}

      {successMessage && (

        <div
          style={successStyle}
        >
          {successMessage}
        </div>

      )}


      {/* =====================================
          CUSTOMER COUNT
      ===================================== */}

      <div
        style={{
          marginTop: "40px",
          marginBottom: "20px",
          fontFamily:
            "Arial, sans-serif",
          fontSize: "11px",
          letterSpacing: "2px",
          color: "#9b7540",
        }}
      >

        {customers.length}{" "}

        {customers.length === 1
          ? "CUSTOMER"
          : "CUSTOMERS"}

      </div>


      {/* =====================================
          EMPTY CUSTOMERS
      ===================================== */}

      {customers.length === 0 ? (

        <section
          style={emptyStyle}
        >

          <h2
            style={emptyTitleStyle}
          >
            No customers found.
          </h2>


          <p
            style={smallTextStyle}
          >
            There are currently no
            registered customers.
          </p>

        </section>

      ) : (

        /* ===================================
           CUSTOMERS TABLE
        =================================== */

        <section
          style={tableContainerStyle}
        >

          <table
            style={tableStyle}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#171513",
                  color:
                    "#ffffff",
                }}
              >

                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  ID
                </th>


                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  CUSTOMER
                </th>


                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  EMAIL
                </th>


                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  ROLE
                </th>


                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  ORDERS
                </th>


                <th
                  style={
                    tableHeaderStyle
                  }
                >
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {customers.map(
                (customer) => {

                  const isDeleting =
                    deletingId ===
                    customer.id;


                  return (

                    <tr
                      key={
                        customer.id
                      }
                      style={{
                        borderBottom:
                          "1px solid #eee8df",
                      }}
                    >

                      {/* ID */}

                      <td
                        style={
                          tableCellStyle
                        }
                      >

                        #
                        {customer.id}

                      </td>


                      {/* CUSTOMER NAME */}

                      <td
                        style={{
                          ...tableCellStyle,
                          fontFamily:
                            "Georgia, serif",
                          fontSize:
                            "17px",
                        }}
                      >

                        {customer.name ||
                          "—"}

                      </td>


                      {/* EMAIL */}

                      <td
                        style={
                          tableCellStyle
                        }
                      >

                        {customer.email ||
                          "—"}

                      </td>


                      {/* ROLE */}

                      <td
                        style={
                          tableCellStyle
                        }
                      >

                        <span
                          style={
                            roleStyle
                          }
                        >

                          {customer.role ||
                            "customer"}

                        </span>

                      </td>


                      {/* ORDERS */}

                      <td
                        style={{
                          ...tableCellStyle,
                          fontFamily:
                            "Georgia, serif",
                          fontSize:
                            "18px",
                        }}
                      >

                        {Number(
                          customer.total_orders ||
                          customer.orders_count ||
                          customer.order_count ||
                          0
                        )}

                      </td>


                      {/* ACTION */}

                      <td
                        style={
                          tableCellStyle
                        }
                      >

                        {customer.role ===
                        "admin" ? (

                          <span
                            style={{
                              color:
                                "#9b7540",
                              fontSize:
                                "10px",
                              letterSpacing:
                                "1px",
                            }}
                          >
                            ADMIN
                          </span>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCustomer(
                                customer
                              )
                            }
                            disabled={
                              isDeleting
                            }
                            style={{
                              padding:
                                "9px 14px",
                              border:
                                "1px solid #b24a3b",
                              background:
                                "transparent",
                              color:
                                "#b24a3b",
                              cursor:
                                isDeleting
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily:
                                "Arial, sans-serif",
                              fontSize:
                                "9px",
                              letterSpacing:
                                "1px",
                              opacity:
                                isDeleting
                                  ? 0.5
                                  : 1,
                            }}
                          >

                            {isDeleting
                              ? "DELETING..."
                              : "DELETE"}

                          </button>

                        )}

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </section>

      )}


      {/* =====================================
          SUMMARY
      ===================================== */}

      {customers.length > 0 && (

        <section
          style={summaryStyle}
        >

          {/* TOTAL */}

          <div>

            <p
              style={
                summaryLabelStyle
              }
            >
              REGISTERED CUSTOMERS
            </p>


            <h2
              style={
                summaryNumberStyle
              }
            >
              {customers.length}
            </h2>

          </div>


          {/* CUSTOMERS */}

          <div>

            <p
              style={
                summaryLabelStyle
              }
            >
              CUSTOMER ACCOUNTS
            </p>


            <h2
              style={
                summaryNumberStyle
              }
            >
              {
                customers.filter(
                  (customer) =>
                    customer.role !==
                    "admin"
                ).length
              }
            </h2>

          </div>


          {/* ADMINS */}

          <div>

            <p
              style={
                summaryLabelStyle
              }
            >
              ADMINS
            </p>


            <h2
              style={
                summaryNumberStyle
              }
            >
              {adminCount}
            </h2>

          </div>

        </section>

      )}

    </main>

  );

}


/* =========================================
   PAGE STYLE
========================================= */

const pageStyle = {

  minHeight: "100vh",

  padding: "60px 8%",

  background: "#f7f4ef",

  color: "#171513",

};


/* =========================================
   LABEL
========================================= */

const labelStyle = {

  margin: 0,

  fontFamily:
    "Arial, sans-serif",

  fontSize: "10px",

  letterSpacing: "4px",

  color: "#9b7540",

};


/* =========================================
   TITLE
========================================= */

const titleStyle = {

  margin:
    "15px 0",

  fontFamily:
    "Georgia, serif",

  fontSize: "52px",

  fontWeight: "400",

};


/* =========================================
   DESCRIPTION
========================================= */

const descriptionStyle = {

  margin: 0,

  fontFamily:
    "Arial, sans-serif",

  color: "#6f6962",

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
   ERROR
========================================= */

const errorStyle = {

  marginTop:
    "30px",

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
   SUCCESS
========================================= */

const successStyle = {

  marginTop:
    "30px",

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

};


/* =========================================
   TABLE CONTAINER
========================================= */

const tableContainerStyle = {

  background:
    "#ffffff",

  border:
    "1px solid #ded8d0",

  overflowX:
    "auto",

};


/* =========================================
   TABLE
========================================= */

const tableStyle = {

  width:
    "100%",

  borderCollapse:
    "collapse",

  minWidth:
    "850px",

};


/* =========================================
   TABLE HEADER
========================================= */

const tableHeaderStyle = {

  padding:
    "16px 18px",

  textAlign:
    "left",

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "9px",

  letterSpacing:
    "1.5px",

  fontWeight:
    "400",

};


/* =========================================
   TABLE CELL
========================================= */

const tableCellStyle = {

  padding:
    "18px",

  textAlign:
    "left",

  fontFamily:
    "Arial, sans-serif",

  fontSize:
    "13px",

  color:
    "#4f4a45",

};


/* =========================================
   ROLE
========================================= */

const roleStyle = {

  display:
    "inline-block",

  padding:
    "5px 9px",

  background:
    "#f1eee8",

  color:
    "#9b7540",

  fontSize:
    "9px",

  letterSpacing:
    "1px",

  textTransform:
    "uppercase",

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
   SUMMARY
========================================= */

const summaryStyle = {

  marginTop:
    "30px",

  padding:
    "30px",

  background:
    "#171513",

  color:
    "#ffffff",

  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",

  gap:
    "25px",

};


/* =========================================
   SUMMARY LABEL
========================================= */

const summaryLabelStyle = {

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
   SUMMARY NUMBER
========================================= */

const summaryNumberStyle = {

  margin: 0,

  fontFamily:
    "Georgia, serif",

  fontSize:
    "30px",

  fontWeight:
    "400",

};


export default AdminCustomers;