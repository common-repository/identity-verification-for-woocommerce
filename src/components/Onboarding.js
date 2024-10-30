import {
  Button,
  CalloutCard,
  DisplayText,
  Frame,
  Layout,
  Link,
  Page,
  PageActions,
  ProgressBar,
  TextContainer,
  TextStyle,
} from "@shopify/polaris";

import React, { useState, useContext, useEffect } from "react";
import { amplitudeEvent } from "components/initAmplitude";
import { asset } from "../helpers";
import useRedirect from "../hooks/useRedirect";
import { updateSettings } from "../services/wpApi";
import { useShop } from "../providers/ShopProvider";

const StepOne = () => {
  useEffect(() => {
    amplitudeEvent("Onboarding - step 1 - ID capture video");
  }, []);

  return (
    <Layout>
      <Layout.Section oneHalf>
        <video
          src={asset("/demo-videos/step-1-mod-screenflow.mp4")}
          muted
          autoPlay
          loop
          width="300"
          height="600"
          style={{
            border: "3px solid rgb(232, 226, 216)",
          }}
        />
      </Layout.Section>
      <Layout.Section oneHalf>
        <TextStyle variation="subdued">Step one</TextStyle>
        <DisplayText size="large">ID document capture </DisplayText>
        <br />
        <DisplayText size="small">
          Your customer uploads their ID document with a secure connection using
          their mobile device.{" "}
        </DisplayText>
        <br />

        <DisplayText size="small">
          The high resolution photo of the ID is verified for its authenticity
          within seconds.
        </DisplayText>
        <br />
        <DisplayText size="small">
          Real ID supports hundreds of documents from many different countries.
        </DisplayText>
      </Layout.Section>
    </Layout>
  );
};

const StepTwo = () => {
  useEffect(() => {
    amplitudeEvent("Onboarding - step 2 - Facial recognition video");
  }, []);

  return (
    <Layout>
      <Layout.Section oneHalf>
        <video
          src={asset("/demo-videos/step-4-screenflow.mp4")}
          muted
          autoPlay
          loop
          width="300"
          height="600"
          style={{
            border: "3px solid rgb(232, 226, 216)",
          }}
        />
      </Layout.Section>
      <Layout.Section oneHalf>
        <TextStyle variation="subdued">Step two</TextStyle>
        <br />

        <DisplayText size="large">Facial Recognition</DisplayText>
        <br />

        <DisplayText size="small">
          The customer takes a headshot photo with their mobile device.
        </DisplayText>
        <br />

        <DisplayText size="small">
          This photo is compared against the ID document for maximum security.
        </DisplayText>
      </Layout.Section>
    </Layout>
  );
};

const StepThree = () => {
  useEffect(() => {
    amplitudeEvent("Onboarding - step 3 - Instant results screenshot");
  }, []);

  return (
    <Layout>
      <Layout.Section oneHalf>
        <video
          src={asset("/demo-videos/step-5-screenflow.mp4")}
          muted
          autoPlay
          loop
          width="300"
          height="600"
          style={{
            border: "3px solid rgb(232, 226, 216)",
          }}
        />
      </Layout.Section>
      <Layout.Section oneHalf>
        <TextContainer spacing="loose">
          <TextStyle variation="subdued">Step three</TextStyle>
          <DisplayText size="large">Instant Results to WooCommerce</DisplayText>
          <DisplayText size="small">You're clear to fulfill!</DisplayText>
          <DisplayText size="small">
            Real ID's ID verification algorithm instantly screens the photos for
            fraud signals. It event reads the fields from the ID such as name,
            address & date of birth.
          </DisplayText>
          <DisplayText size="small">
            Your customer and order are flagged to easily find ID results as
            well as automatically remember repeat customers.
          </DisplayText>
          <DisplayText size="small">
            The results are available in the app, easily accessible from your
            WooCommerce dashboard.
          </DisplayText>
        </TextContainer>
      </Layout.Section>
    </Layout>
  );
};

const StepFour = ({ setCompleted }) => {
  const [submitting, setSubmitting] = useState(false);
  const redirect = useRedirect();
  const { setShop, shop } = useShop();

  useEffect(() => {
    amplitudeEvent("Onboarding - step 4 - prompt all IDv for all orders");
  }, []);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "4em",
          background: "white",
          margin: "40px auto",
          width: "100%",
          borderRadius: "0.25em",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ maxWidth: "400px", marginRight: "30px" }}>
          <DisplayText size="extraLarge">
            Protect your store in minutes
          </DisplayText>
          <br />
          <DisplayText size="small">
            Real ID is the best way to fully automate ID verification with the
            power of AI
          </DisplayText>
          <br />

          <ul>
            <li>Meet compliance in minutes</li>
            <li>Prevent fraud and decrease chargebacks</li>
            <li>Provide a seamless customer experience</li>
          </ul>
          <style jsx>{`
            ul {
              padding: 0;
              margin: 5px 0;
            }

            li {
              margin: 0 0 8px 8px;
              list-style-type: none;
              color: #425871;
              font-size: 1.2em;
              line-height: 1.4;
            }

            li:before {
              content: "✅";
              padding-right: 8px;
            }
          `}</style>
        </div>

        <div
          style={{
            flex: 1,
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ padding: "50px 0 5px" }}>
              <Button
                primary
                loading={submitting}
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  const { data } = await updateSettings({
                    completedOnboarding: true,
                  });
                  setShop({ ...shop, ...{ settings: data.settings } });
                  redirect("/");
                }}
              >
                Let's get started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Done = () => {
  return (
    <Layout>
      <div
        style={{
          padding: "4em",
          textAlign: "center",
          background: "white",
          margin: "40px auto",
          width: "100%",
          borderRadius: "0.25em",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <DisplayText size="extraLarge">
          Nice work! Your store is now verifying customer identities.
        </DisplayText>
        <br />
        <DisplayText size="small">
          You can configure additional settings to meet your <br />
          business requirements over on the Settings page.
        </DisplayText>
        <br />
        <Button
          primary
          fullWidth
          url="/settings"
          onClick={() => {
            // redirect to settings
          }}
        >
          Go to settings
        </Button>
      </div>
    </Layout>
  );
};

const Landing = ({ setTouring }) => {
  useEffect(() => {
    amplitudeEvent("Onboarding - opened landing");
  }, []);
  const redirect = useRedirect();
  const { shop, setShop } = useShop();

  return (
    <>
      <div>
        <CalloutCard
          title="Start verifying your customers in two minutes"
          illustration="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_1000/v1628099476/Real%20ID/Onboarding/shutterstock_1658387542.jpg"
          primaryAction={{
            content: "Show me how it works",
            onAction: (e) => {
              setTouring(true);
            },
          }}
          secondaryAction={{
            content: "Skip the tour",
            onAction: async (e) => {
              const { data } = await updateSettings({
                completedOnboarding: true,
              });
              setShop({ ...shop, ...{ settings: data.settings } });
              redirect("/");
              amplitudeEvent("Skipped onboarding tour");
            },
          }}
        >
          <p>
            Protect your business by enabling ID verification checks on your
            WooCommerce store.
          </p>
          <p></p>
        </CalloutCard>
        <style jsx>{`
          img.Polaris-CalloutCard__Image {
            width: 400px !important;
          }
        `}</style>
      </div>
      <div
        style={{
          margin: "60px 0 120px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          rowGap: "150px",
        }}
      >
        <TextContainer>
          <DisplayText size="large">Automate ID verification</DisplayText>
          <DisplayText size="small">
            Real ID uses machine learning to verify your customer's identities
            with an actual photo of their government-issued ID and headshot – so
            you can be sure your customer is who they claim to be.
          </DisplayText>
          <DisplayText size="small">
            <strong>ID Verification (IDv)</strong> helps you prevent fraudulent
            orders and meet compliance in a fraction of the time, saving you and
            your organization time and money.
          </DisplayText>
        </TextContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          {/* <img src="/magic-hat.png" width="203" height="183" style={{ */}
          <img
            src="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_400/v1628082689/Real%20ID/Onboarding/224408887-huge.jpg"
            // width="403"
            // height="183"
            style={{
              border: "3px solid rgb(226, 227, 227)",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transform: "rotate(-1deg)",
            }}
          />
        </div>

        <TextContainer>
          <DisplayText size="large">
            Meet compliance requirements in minutes, not weeks
          </DisplayText>
          <DisplayText size="small">
            Securely capture your customers' IDs through their mobile phone and
            displays their photo & authenticity scores right within WooCommerce.
          </DisplayText>
          <DisplayText size="small">
            Compatible with over 600 different types of international documents,
            drivers licenses, passports and other legal documents.
          </DisplayText>
        </TextContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <img
            src="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_400/v1628081109/Real%20ID/Onboarding/constantin-wenning-idDvA4jPBO8-unsplash.jpg"
            // width="203"
            // height="183"
            style={{
              border: "3px solid rgb(226, 227, 227)",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transform: "rotate(1deg)",
            }}
          />
        </div>

        <TextContainer>
          <DisplayText size="large">Stop fraud before it happens</DisplayText>
          <DisplayText size="small">
            Protect your business and prevent chargebacks by verifying your
            customers' identities.
          </DisplayText>
          <DisplayText size="small">
            Easily verify your customer's ownership of their purchasing credit
            card by matching against their submitted ID.
          </DisplayText>
        </TextContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <img
            src="https://res.cloudinary.com/tinyhouse/image/upload/c_scale,w_400/v1628082821/Real%20ID/Onboarding/shutterstock_1097913926.jpg"
            // width="203"
            // height="183"
            style={{
              border: "3px solid rgb(226, 227, 227)",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transform: "rotate(-2deg)",
            }}
          />
        </div>
      </div>
      <PageActions
        primaryAction={{
          content: "Show me how it works",
          onAction: () => {
            setTouring(true);
          },
        }}
        secondaryActions={[
          {
            content: "Skip the tour",
            onAction: async () => {
              const { data } = await updateSettings({
                completedOnboarding: true,
              });
              setShop({ ...shop, ...{ settings: data.settings } });
              redirect("/");
              amplitudeEvent("Skipped onboarding tour");
            },
          },
        ]}
      />
    </>
  );
};

// pages/onboarding.js
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [touring, setTouring] = useState(false);
  const [completed, setCompleted] = useState(false);

  const progress = () => {
    switch (step) {
      case 1:
        return 30;
      case 2:
        return 58;
      case 3:
        return 75;
      case 4:
        return 91;
      default:
        return 0;
    }
  };

  return (
    <>
      <Frame>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "2px solid rgb(206, 210, 219)",
            backgroundColor: `rgb(47, 54, 81)`,
            color: `#fff`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 1em",
              fontFamily: "Roboto Slab, serif",
              display: "flex",
            }}
          >
            <span style={{ fontSize: "8em" }}>Real</span>
            <span
              style={{
                fontSize: "8em",
                fontWeight: "bold",
              }}
            >
              ID
            </span>
            <span
              style={{
                fontSize: "2em",
                transform: "translateY(-25px)",
              }}
            >
              ™
            </span>
          </div>
          <DisplayText size="extraLarge">
            Secure identity verification. <br />
            Powered by AI. Built to scale.
          </DisplayText>
          <img
            width="400px"
            alt="Real ID - secure identity verification. Powered by AI. Built to scale."
            src={asset("globe-array.png")}
            className="opacity-15"
            style={{
              layout: "fill",
              objectFit: "cover",
              // quality: {100}
            }}
          />
          <style global jsx>{`
            .opacity-15 {
              opacity: 0.15;
            }
          `}</style>
        </div>

        <Page>
          {!touring && !completed && <Landing setTouring={setTouring} />}

          {touring && !completed && (
            <div>
              <div style={{ marginBottom: "2em" }}>
                <ProgressBar
                  size="small"
                  color="success"
                  progress={progress()}
                />
              </div>

              <div style={{ minHeight: "500px" }}>
                {step === 1 && <StepOne />}
                {step === 2 && <StepTwo />}
                {step === 3 && <StepThree />}
                {step === 4 && <StepFour setCompleted={setCompleted} />}
              </div>

              {step < 4 && (
                <PageActions
                  primaryAction={{
                    content: "Next",
                    onAction: () => setStep(step + 1),
                  }}
                  secondaryActions={[
                    {
                      content: "Back",
                      onAction: () => {
                        if (step === 1) {
                          setTouring(false);
                        } else {
                          setStep(step - 1);
                        }
                      },
                    },
                  ]}
                />
              )}
            </div>
          )}

          {completed && <Done />}
        </Page>
      </Frame>
    </>
  );
}
