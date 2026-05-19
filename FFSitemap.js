SalesforceInteractions.init({
    cookieDomain: "flyingflea.royalenfield.com",
    consents: [
        {
            purpose: SalesforceInteractions.mcis.ConsentPurpose.Personalization,
            provider: "Example Consent Manager",
            status: SalesforceInteractions.ConsentStatus.OptIn,
        },
    ],
}).then(() => {
    SalesforceInteractions.setLoggingLevel("DEBUG");
    let ffClubModalFormData = {};

    // Scroll depth tracking
    setTimeout(() => {
        [0.4, 0.5, 0.7, 1].forEach((threshold) => {
            SalesforceInteractions.DisplayUtils.pageScroll(threshold).then(() => {
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: `Scrolled ${threshold * 100}% of Page`,
                        attributes: {
                            pageUrl: window.location.href,
                            pagePath: window.location.pathname,
                        },
                    },
                });
                console.log(`Scroll Event: ${threshold * 100}%`);
            });
        });
    }, 500);

    // Sitemap config
    //v2
    const sitemapConfig = {
        global: {
            listeners: [
                SalesforceInteractions.listener("change", "#bookTestRideForm input, #bookTestRideForm select", (event) => {

                    const firstName = SalesforceInteractions.cashDom("#firstName").val().trim() || "";
                    const lastName = SalesforceInteractions.cashDom("#lastName").val().trim() || "";
                    const emailAddress = SalesforceInteractions.cashDom("#emailId").val().trim() || "";
                    const phone = SalesforceInteractions.cashDom("#mobileNo").val().trim() || "";
                    const country = SalesforceInteractions.cashDom("#country").val() || "";
                    const pincode = SalesforceInteractions.cashDom("#pincode").val().trim() || "";

                    // Only send when at least one field has value (avoid empty noise)
                    if (firstName || lastName || emailAddress || country || pincode) {

                        SalesforceInteractions.sendEvent({
                            interaction: {
                                name: "Test Ride Form Field Updated"
                            },
                            user: {
                                attributes: {
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: emailAddress,
                                    country: country,
                                    pincode: pincode
                                }
                            }
                        });
                    }

                    if (/^\d{10,}$/.test(phone)) {
                        SalesforceInteractions.sendEvent({
                            interaction: {
                                name: "Phone Captured"
                            },
                            user: {
                                identities: {
                                    phone: phone
                                }
                            }
                        })
                    }
                }),
            ],
        },

        pageTypeDefault: {
            name: "default",
            interaction: { name: "Default Page" },
        },

        pageTypes: [

            {
                name: "Product Page",
                isMatch: function () {
                    return /\/in\/en\/product\/(c6|s6)\//.test(window.location.pathname);
                },
                interaction: {
                    name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
                    catalogObject: {
                        type: "Product",
                        id: (() => {
                            const match = window.location.pathname.match(/\/in\/en\/product\/(c6|s6)/);
                            return match ? match[1] : "";
                        })(),
                    }
                },
            },
            {
                name: "C6 Test Ride Page",
                isMatch: () => {
                    return window.location.href.includes("/in/en/motorcycles/C6/test-ride");
                },
                interaction: {
                    name: "View C6 Test Ride Page"
                },
                listeners: [
                    SalesforceInteractions.listener("click", "#trVerifyOtp", () => {

                        const targetNode = document.querySelector("#proceedSuccessScreen");

                        if (!targetNode) return;

                        const observer = new MutationObserver(() => {

                            const successScreen = SalesforceInteractions.cashDom("#proceedSuccessScreen");
                            const userName = successScreen.find(".user-name").text().trim();

                            // ✅ Fire only when BOTH conditions are met
                            if (successScreen.hasClass("active") && userName) {

                                const dealerName = successScreen.find(".success-dealer-name").text().trim();
                                const address = successScreen.find(".success-full-address").text().trim();

                                observer.disconnect(); // stop observing

                                SalesforceInteractions.sendEvent({
                                    interaction: {
                                        name: "C6 Test Ride Form Submitted"
                                    },
                                });

                            }

                        });

                        // 👇 Observe both class + content changes
                        observer.observe(targetNode, {
                            attributes: true,      // for class changes (active)
                            childList: true,       // for text changes
                            subtree: true          // for nested updates
                        });

                    })
                ],
            },
            {
                name: "FAQ Page",
                isMatch: () => {
                    return window.location.href.includes("/in/en/faq/");
                },
                interaction: { name: "View FAQ Page" },
            },
        ],
    };

    SalesforceInteractions.initSitemap(sitemapConfig);
});