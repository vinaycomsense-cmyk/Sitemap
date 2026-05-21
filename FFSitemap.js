const currentHost = window.location.hostname;
//updatedd
let cookieDomain = "";

if (currentHost === "flyingflea.royalenfield.com") {
  cookieDomain = "flyingflea.royalenfield.com";
} else if (currentHost === "booking.flyingflea.com") {
  cookieDomain = "booking.flyingflea.com";
}

function initializeSitemap() {
  const sitemapConfig = {
    global: {
      listeners: [
        SalesforceInteractions.listener(
          "change",
          "#bookTestRideForm input, #bookTestRideForm select",
          () => {
            const firstName =
              SalesforceInteractions.cashDom("#firstName").val()?.trim() || "";

            const lastName =
              SalesforceInteractions.cashDom("#lastName").val()?.trim() || "";

            const emailAddress =
              SalesforceInteractions.cashDom("#emailId").val()?.trim() || "";

            const phone =
              SalesforceInteractions.cashDom("#mobileNo").val()?.trim() || "";

            const country =
              SalesforceInteractions.cashDom("#country").val() || "";

            const pincode =
              SalesforceInteractions.cashDom("#pincode").val()?.trim() || "";

            if (firstName || lastName || emailAddress || country || pincode) {
              SalesforceInteractions.sendEvent({
                interaction: {
                  name: "Test Ride Form Field Updated",
                },

                user: {
                  // identities: {
                  //     emailAddress: emailAddress
                  // },

                  attributes: {
                    firstName: firstName,
                    lastName: lastName,
                    email: emailAddress,
                    country: country,
                    pincode: pincode,
                  },
                },
              });
            }
          },
        ),

        SalesforceInteractions.listener("change", "#mobileNo", () => {
          const phone =
            SalesforceInteractions.cashDom("#mobileNo").val()?.trim() || "";

          // Send only when valid 10 digit phone entered
          if (/^\d{10}$/.test(phone)) {
            SalesforceInteractions.sendEvent({
              interaction: {
                name: "Phone Captured",
              },

              user: {
                identities: {
                  phone: phone,
                },
              },
            });
          }
        }),

        SalesforceInteractions.listener(
          "click",
          "button[aria-disabled='false']",
          () => {
            const buttonText = SalesforceInteractions.cashDom(
              "button[aria-disabled='false']",
            )
              .text()
              ?.trim();

            // Verify button clicked
            if (
              currentHost === "booking.flyingflea.com" &&
              window.location.pathname === "/validate-otp" &&
              buttonText === "Verify"
            ) {
              // Wait for redirect to /booking
              setTimeout(() => {
                if (window.location.pathname === "/booking") {
                  const mobileNumber =
                    sessionStorage.getItem("ff_mobile_number") || "";

                  const cleanedPhone = mobileNumber.replace(/\D/g, "");

                  SalesforceInteractions.sendEvent({
                    interaction: {
                      name: "Sign In Successfully",
                    },

                    user: {
                      identities: {
                        phone: cleanedPhone,
                      },
                    },
                  });

                  // Remove after sending
                  sessionStorage.removeItem("ff_mobile_number");
                }
              }, 3000);
            }
          },
        ),
      ],
    },

    pageTypeDefault: {
      name: "default",
      interaction: {
        name: "Default Page",
      },
    },

    pageTypes: [
      {
        name: "Product Page",

        isMatch: () => {
          return /\/in\/en\/product\/(c6|s6)\//.test(window.location.pathname);
        },

        interaction: {
          name: SalesforceInteractions.CatalogObjectInteractionName
            .ViewCatalogObject,

          catalogObject: {
            type: "Product",

            id: (() => {
              const match = window.location.pathname.match(
                /\/in\/en\/product\/(c6|s6)/,
              );

              return match ? match[1] : "";
            })(),
          },
        },
      },
      //check
      {
        name: "C6 Test Ride Page",

        isMatch: () => {
          return (
            currentHost === "flyingflea.royalenfield.com" &&
            window.location.pathname === "/in/en/motorcycles/C6/test-ride/"
          );
        },

        interaction: {
          name: "View C6 Test Ride Page",
        },
      },

      {
        name: "C6 Test Ride Confirmation Page",

        isMatch: () => {
          return (
            currentHost === "flyingflea.royalenfield.com" &&
            window.location.pathname.includes(
              "/in/en/motorcycles/C6/test-ride/Confirm/",
            )
          );
        },

        interaction: {
          name: "C6 Test Ride Form Submitted",
        },
      },
      //up
      {
        name: "Booking Cart Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/cart"
          );
        },

        interaction: {
          name: "View Booking Cart Page",
        },
      },

      {
        name: "Booking Journey Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/booking"
          );
        },

        interaction: {
          name: "View Booking Journey Page",
        },

        listeners: [
          SalesforceInteractions.listener(
            "change",
            "input[name='pincode']",
            () => {
              const pincode =
                SalesforceInteractions.cashDom("input[name='pincode']")
                  .val()
                  ?.trim() || "";

              // Send only when valid 6 digit pincode entered
              if (/^\d{6}$/.test(pincode)) {
                SalesforceInteractions.sendEvent({
                  interaction: {
                    name: "Pincode Captured",
                  },

                  user: {
                    attributes: {
                      pincode: pincode,
                    },
                  },
                });
              }
            },
          ),
        ],
      },

      {
        name: "Signin Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/signin"
          );
        },

        interaction: {
          name: "View Signin Page",
        },

        listeners: [
          SalesforceInteractions.listener(
            "click",
            "button[aria-disabled='false']",
            () => {
              const buttonText = SalesforceInteractions.cashDom(
                "button[aria-disabled='false']",
              )
                .text()
                ?.trim();

              // Continue button clicked
              if (buttonText === "Continue") {
                const mobileNumber =
                  SalesforceInteractions.cashDom("input[name='mobile']")
                    .val()
                    ?.trim() || "";

                // Validate 10 digit mobile
                if (/^\d{10}$/.test(mobileNumber)) {
                  // Store temporarily
                  sessionStorage.setItem("ff_mobile_number", mobileNumber);
                }
              }
            },
          ),
        ],
      },

      {
        name: "Validate OTP Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/validate-otp"
          );
        },

        interaction: {
          name: "View Validate OTP Page",
        },
      },

      {
        name: "Booking Details Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/booking-details"
          );
        },

        interaction: {
          name: "View Booking Details Page",
        },

        listeners: [
          SalesforceInteractions.listener(
            "click",
            "button[aria-disabled='false']",
            () => {
              const buttonText = SalesforceInteractions.cashDom(
                "button[aria-disabled='false']",
              )
                .text()
                ?.trim();

              // Continue button clicked
              if (buttonText === "Continue") {
                const firstName =
                  SalesforceInteractions.cashDom("input[name='firstName']")
                    .val()
                    ?.trim() || "";

                const middleName =
                  SalesforceInteractions.cashDom("input[name='middleName']")
                    .val()
                    ?.trim() || "";

                const lastName =
                  SalesforceInteractions.cashDom("input[name='lastName']")
                    .val()
                    ?.trim() || "";

                const fatherName =
                  SalesforceInteractions.cashDom("input[name='fatherName']")
                    .val()
                    ?.trim() || "";

                const email =
                  SalesforceInteractions.cashDom("input[name='email']")
                    .val()
                    ?.trim() || "";

                const mobile =
                  SalesforceInteractions.cashDom("input[name='mobile']")
                    .val()
                    ?.trim() || "";

                const addressLine1 =
                  SalesforceInteractions.cashDom("input[name='addressLine1']")
                    .val()
                    ?.trim() || "";

                const addressLine2 =
                  SalesforceInteractions.cashDom("input[name='addressLine2']")
                    .val()
                    ?.trim() || "";

                const pincode =
                  SalesforceInteractions.cashDom(
                    "input[name='pincode-display']",
                  )
                    .val()
                    ?.trim() || "";

                const city =
                  SalesforceInteractions.cashDom("input[name='city-display']")
                    .val()
                    ?.trim() || "";

                const state =
                  SalesforceInteractions.cashDom("input[name='state-display']")
                    .val()
                    ?.trim() || "";

                const financeRequired =
                  SalesforceInteractions.cashDom(
                    "input[name='financeRequired']:checked",
                  ).val() || "";

                const ownershipStatus =
                  SalesforceInteractions.cashDom(
                    "input[name='ownershipStatus']:checked",
                  ).val() || "";

                SalesforceInteractions.sendEvent({
                  interaction: {
                    name: "Booking Details Submitted",
                    type: "FormSubmit",
                  },

                  user: {
                    identities: {
                      phone: mobile,
                    },

                    attributes: {
                      firstName: firstName,
                      middleName: middleName,
                      lastName: lastName,
                      fatherName: fatherName,
                      email: email,
                      addressLine1: addressLine1,
                      addressLine2: addressLine2,
                      pincode: pincode,
                      city: city,
                      state: state,
                      financeRequired: financeRequired,
                      ownershipStatus: ownershipStatus,
                    },
                  },
                });
              }
            },
          ),
        ],
      },

      {
        name: "Confirmation Page",

        isMatch: () => {
          return (
            currentHost === "booking.flyingflea.com" &&
            window.location.pathname === "/confirmation"
          );
        },

        interaction: {
          name: "View Confirmation Page",
        },
      },
      //up
      {
        name: "Flying Flea Login Page",

        isMatch: () => {
          return (
            currentHost === "flyingflea.royalenfield.com" &&
            window.location.pathname === "/in/en/users/login/"
          );
        },

        interaction: {
          name: "Login Page",
        },

        listeners: [
          SalesforceInteractions.listener("click", "#login-otp-verify", () => {
            const verifyButton =
              SalesforceInteractions.cashDom("#login-otp-verify");

            const isDisabled = verifyButton.prop("disabled");

            if (!isDisabled) {
              // Get mobile number
              const mobileNumber =
                SalesforceInteractions.cashDom("input[type='tel']")
                  .val()
                  ?.trim() || "";

              // Store temporary login flag
              sessionStorage.setItem("ff_login_success", "true");

              // Store mobile number
              sessionStorage.setItem("ff_mobile_number", mobileNumber);
            }
          }),
        ],
      },

      {
        name: "User Profile Page",

        isMatch: () => {
          const isProfilePage =
            currentHost === "flyingflea.royalenfield.com" &&
            window.location.pathname === "/in/en/users/user-profile/";

          if (isProfilePage) {
            const loginSuccess = sessionStorage.getItem("ff_login_success");

            if (loginSuccess === "true") {
              const mobileNumber =
                sessionStorage.getItem("ff_mobile_number") || "";

              SalesforceInteractions.sendEvent({
                interaction: {
                  name: "Login Successfully",
                },

                user: {
                  identities: {
                    phone: mobileNumber,
                  },
                },
              });

              sessionStorage.removeItem("ff_login_success");

              sessionStorage.removeItem("ff_mobile_number");
            }
          }

          return isProfilePage;
        },

        interaction: {
          name: "User Profile Page",
        },
      },

      {
        name: "FAQ Page",

        isMatch: () => {
          return window.location.href.includes("/in/en/faq/");
        },

        interaction: {
          name: "View FAQ Page",
        },
      },
    ],
  };

  SalesforceInteractions.initSitemap(sitemapConfig);
}

SalesforceInteractions.init({
  cookieDomain: cookieDomain,

  consents: [
    {
      purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,

      provider: "Example Consent Manager",

      status: SalesforceInteractions.ConsentStatus.OptIn,
    },
  ],
}).then(() => {
  SalesforceInteractions.setLoggingLevel("DEBUG");

  initializeSitemap();

  // React SPA Route Change Handling
  let lastPath = window.location.pathname;

  setInterval(() => {
    const currentPath = window.location.pathname;

    if (currentPath !== lastPath) {
      lastPath = currentPath;
      setTimeout(() => {
        SalesforceInteractions.reinit();
      }, 500);
    }
  }, 1000);
});
