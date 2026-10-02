import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { OrderContext } from "./OrderContext";


export function OrderProvider({ children }) {

  const [orders, setOrders] =
    useState([]);

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");


  /* =========================================
     GET JWT TOKEN
  ========================================= */

  const getToken = () => {

    return localStorage.getItem(
      "qaverin-token"
    );

  };


  /* =========================================
     FETCH ORDERS FROM BACKEND
  ========================================= */

  const fetchOrders = useCallback(
    async () => {

      const token =
        getToken();


      /* =====================================
         NO TOKEN
      ===================================== */

      if (!token) {

        setOrders([]);

        setLoadingOrders(false);

        return;

      }


      try {

        setLoadingOrders(true);

        setOrderError("");


        /* ===================================
           API REQUEST
        =================================== */

        const response =
          await fetch(
            "http://127.0.0.1:5000/api/orders",
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const data =
          await response.json();


        /* ===================================
           TOKEN EXPIRED / INVALID
        =================================== */

        if (
          response.status === 401
        ) {

          setOrders([]);

          setOrderError(
            "Session expired. Please login again."
          );

          return;

        }


        /* ===================================
           OTHER API ERROR
        =================================== */

        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch orders"
          );

        }


        /* ===================================
           BACKEND ORDERS
        =================================== */

        const backendOrders =
          Array.isArray(data.orders)
            ? data.orders
            : [];


        /* ===================================
           FORMAT ORDERS
        =================================== */

        const formattedOrders =
          backendOrders.map(
            (order) => ({

              ...order,


              /* =============================
                 TOTAL
              ============================= */

              total:
                Number(
                  order.total_amount || 0
                ),


              /* =============================
                 DATE
              ============================= */

              createdAt:
                order.created_at,


              date:
                order.created_at
                  ? new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "—",


              /* =============================
                 STATUS
              ============================= */

              status:
                order.status ||
                "Pending",

            })
          );


        /* ===================================
           SAVE ORDERS
        =================================== */

        setOrders(
          formattedOrders
        );

        setOrderError("");

      }

      catch (error) {

        console.error(
          "Fetch orders error:",
          error
        );


        setOrderError(
          error.message ||
          "Unable to fetch orders"
        );

      }

      finally {

        setLoadingOrders(false);

      }

    },
    []
  );


  /* =========================================
     INITIAL FETCH
     
     setTimeout prevents the React
     set-state-in-effect warning because
     fetchOrders starts after the effect
     has completed.
  ========================================= */

  useEffect(() => {

    const timer =
      setTimeout(() => {

        fetchOrders();

      }, 0);


    return () => {

      clearTimeout(timer);

    };

  }, [fetchOrders]);


  /* =========================================
     CLEAR ORDERS ON LOGOUT
  ========================================= */

  useEffect(() => {

    const handleLogout = () => {

      /*
        Clear the previous user's orders
        from React state.

        This does NOT delete orders
        from MySQL.
      */

      setOrders([]);

      setOrderError("");

      setLoadingOrders(false);

    };


    window.addEventListener(
      "qaverin-logout",
      handleLogout
    );


    return () => {

      window.removeEventListener(
        "qaverin-logout",
        handleLogout
      );

    };

  }, []);


  /* =========================================
     GET ORDER BY ID
  ========================================= */

  const getOrderById = (id) => {

    return orders.find(
      (order) =>
        String(order.id) ===
        String(id)
    );

  };


  /* =========================================
     ADD ORDER
     
     Backend creates the real order.

     This function temporarily adds the
     backend response to React state so
     existing Checkout code doesn't break.
  ========================================= */

  const addOrder = (order) => {

    if (!order) {

      return null;

    }


    const formattedOrder = {

      ...order,


      /* =====================================
         TOTAL
      ===================================== */

      total:
        Number(
          order.total ||
          order.total_amount ||
          0
        ),


      /* =====================================
         DATE
      ===================================== */

      createdAt:
        order.createdAt ||
        order.created_at ||
        new Date().toISOString(),


      date:
        order.date ||

        (
          order.created_at

            ? new Date(
                order.created_at
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )

            : new Date()
                .toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
        ),


      /* =====================================
         STATUS
      ===================================== */

      status:
        order.status ||
        "Pending",

    };


    setOrders(
      (currentOrders) => {

        /* ===============================
           PREVENT DUPLICATE ORDER
        =============================== */

        const alreadyExists =
          currentOrders.some(
            (item) =>
              String(item.id) ===
              String(formattedOrder.id)
          );


        if (alreadyExists) {

          return currentOrders;

        }


        return [

          formattedOrder,

          ...currentOrders,

        ];

      }
    );


    return formattedOrder;

  };


  /* =========================================
     REFRESH ORDERS
  ========================================= */

  const refreshOrders = () => {

    fetchOrders();

  };


  /* =========================================
     CLEAR ORDERS
     
     This only clears frontend state.

     It does NOT delete orders from MySQL.
  ========================================= */

  const clearOrders = () => {

    setOrders([]);

  };


  /* =========================================
     DELETE ORDER
     
     Currently frontend only.

     It does NOT delete the order from
     the backend/database.
  ========================================= */

  const deleteOrder = (id) => {

    setOrders(
      (currentOrders) =>

        currentOrders.filter(
          (order) =>
            String(order.id) !==
            String(id)
        )

    );

  };


  /* =========================================
     CONTEXT
  ========================================= */

  return (

    <OrderContext.Provider
      value={{

        /* =================================
           ORDERS
        ================================= */

        orders,


        /* =================================
           LOADING
        ================================= */

        loadingOrders,


        /* =================================
           ERROR
        ================================= */

        orderError,


        /* =================================
           FUNCTIONS
        ================================= */

        addOrder,

        getOrderById,

        refreshOrders,

        deleteOrder,

        clearOrders,

      }}
    >

      {children}

    </OrderContext.Provider>

  );

}